#!/usr/bin/env node

/**
 * Hook: Agent Template Update Check (Epic #1978, #1983)
 *
 *   node check-template-update.js             → SessionStart. Checks now and prints a plain
 *                                                notice (SessionStart stdout lands in the
 *                                                agent's context).
 *   node check-template-update.js graph-call  → PostToolUse on any MCP tool (`mcp__.*`) — in
 *                                                practice, whenever the agent talks to the Fae
 *                                                knowledge graph. The agent is already talking to
 *                                                Fae, so this is the moment to ask whether its
 *                                                template is still current: at most once per
 *                                                CHECK_EVERY_MIN, the notice is handed back as
 *                                                hookSpecificOutput.additionalContext (PostToolUse
 *                                                stdout is otherwise not shown to the agent).
 *
 * Both modes read fae-template.json from disk at the moment of the check, so a template
 * updated mid-session (update_local_agent_template rewrites the file) is seen at the next
 * check — no restart, no header, nothing the agent has to remember to send.
 *
 * FAIL-QUIET BY DESIGN: no metadata file (e.g. this repo is the authoring checkout, not a
 * downloaded bundle), no network, or any error → exit 0 silently. The check must never block
 * or delay a session.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const TIMEOUT_MS = 3000;
const CHECK_EVERY_MIN = 60;

const mode = process.argv[2] === 'graph-call' ? 'graph-call' : 'session-start';

function quietExit() {
  process.exit(0);
}

function notify(text) {
  if (mode === 'graph-call') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text },
    }));
  } else {
    console.log(text);
  }
}

let meta;
try {
  meta = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'fae-template.json'), 'utf8'));
} catch {
  // No metadata here. Before concluding "not a downloaded bundle": if this is a LINKED GIT
  // WORKTREE whose main checkout root HAS fae-template.json, the template was downloaded but
  // never committed — worktrees materialize only tracked files, so this session is silently
  // missing every untracked template file (rules, hooks, commands). Warn instead of staying
  // quiet; the fix is committing the template files in the main checkout. Once per session
  // is enough — only at session start.
  if (mode === 'session-start') {
    try {
      const dotGit = path.join(process.cwd(), '.git');
      if (fs.statSync(dotGit).isFile()) {
        const gitdir = (fs.readFileSync(dotGit, 'utf8').match(/^gitdir:\s*(.+)\s*$/m) || [])[1];
        // <main>/.git/worktrees/<name> → <main>
        const mainRoot = gitdir && path.resolve(gitdir, '..', '..', '..');
        if (mainRoot && fs.existsSync(path.join(mainRoot, 'fae-template.json'))) {
          console.log(
            '[Fae] This session runs in a git worktree, but the Fae agent template at the main ' +
            `checkout (${mainRoot}) is not fully committed — fae-template.json (and any other ` +
            'uncommitted template file: rules, hooks, commands) is INVISIBLE here. Commit the ' +
            'template files in the main checkout so worktree sessions get the full template.'
          );
        }
      }
    } catch { /* fail-quiet */ }
  }
  quietExit(); // not a downloaded bundle — nothing to check
}

const { variantKey, version, gatewayBaseUrl } = meta || {};
if (!variantKey || !version || !gatewayBaseUrl) quietExit();

// Claude Code runs hooks with the SYSTEM node — below Node 18 there is no global fetch and
// calling it throws a SYNCHRONOUS ReferenceError (stderr noise at every session start,
// breaking the fail-quiet guarantee, #2008).
if (typeof fetch !== 'function' ||
    typeof AbortSignal === 'undefined' || typeof AbortSignal.timeout !== 'function') {
  quietExit();
}

// Throttle the graph-call mode: one network call per CHECK_EVERY_MIN per repo, not one per
// graph call. The stamp is written BEFORE the fetch so a failing gateway is not retried on
// every call either. State lives per repo (hash of cwd) under the user's home, like the
// worklog hooks.
if (mode === 'graph-call') {
  try {
    const stateDir = path.join(os.homedir(), '.claude', 'fae-template-check');
    fs.mkdirSync(stateDir, { recursive: true });
    const file = path.join(stateDir, `${crypto.createHash('sha256').update(process.cwd()).digest('hex').slice(0, 16)}.json`);
    let state = {};
    try { state = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* fresh */ }
    const now = Date.now();
    if (state.lastCheckedAt && now - state.lastCheckedAt < CHECK_EVERY_MIN * 60 * 1000) quietExit();
    fs.writeFileSync(file, JSON.stringify({ lastCheckedAt: now }));
  } catch {
    quietExit();
  }
}

// Epic #2147: organization-customized templates. Passing the org makes the answer ORG-AWARE —
// an org with customizations gets its pinned version plus its overlay revision, so we can tell
// "the platform updated the template" apart from "your organization changed its customizations".
const orgQuery = meta.organizationId
  ? `?organizationId=${encodeURIComponent(meta.organizationId)}`
  : '';
const url = `${gatewayBaseUrl.replace(/\/+$/, '')}/api/client/agent-templates/${encodeURIComponent(variantKey)}/latest${orgQuery}`;

fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  .then((res) => (res.ok ? res.json() : null))
  .then((latest) => {
    if (!latest || !latest.version) quietExit();
    const localRevision = typeof meta.overlayRevision === 'number' ? meta.overlayRevision : null;
    const remoteRevision = typeof latest.overlayRevision === 'number' ? latest.overlayRevision : null;
    if (latest.version !== version) {
      notify(
        `[Fae] A newer version of this agent template is available: ${latest.version} ` +
        `(you have ${version}). Run /update-template (update_local_agent_template), or download ` +
        `it from the Fae portal under Agent templates.`
      );
    } else if (remoteRevision !== null && remoteRevision !== localRevision) {
      notify(
        `[Fae] Your organization updated its template customizations. ` +
        `Run /update-template (variant ${variantKey}, version ${version}) to pick them up.`
      );
    }
    // No process.exit here: stdout to a pipe is asynchronous on macOS, and exiting right after
    // the write can drop the notice. Nothing is pending, so the process ends on its own.
  })
  .catch(quietExit);
