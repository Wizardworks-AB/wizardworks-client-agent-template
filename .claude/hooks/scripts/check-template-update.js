#!/usr/bin/env node

/**
 * Hook: Agent Template Update Check (Epic #1978, #1983)
 *
 * Runs on session start. Reads the bundle metadata file (fae-template.json,
 * written by Fae when the template was downloaded) and asks the Fae gateway
 * for the latest published version of this template variant. Prints a notice
 * when a newer version exists.
 *
 * FAIL-QUIET BY DESIGN: no metadata file (e.g. this repo is the authoring
 * checkout, not a downloaded bundle), no network, or any error → exit 0
 * silently. The update check must never block or delay a session.
 */

const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 3000;

function quietExit() {
  process.exit(0);
}

let meta;
try {
  meta = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'fae-template.json'), 'utf8'));
} catch {
  // No metadata here. Before concluding "not a downloaded bundle": if this is a LINKED GIT
  // WORKTREE whose main checkout root HAS fae-template.json, the template was downloaded but
  // never committed — worktrees materialize only tracked files, so this session is silently
  // missing every untracked template file (rules, hooks, commands). Warn instead of staying
  // quiet; the fix is committing the template files in the main checkout.
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
      console.log(
        `[Fae] A newer version of this agent template is available: ${latest.version} ` +
        `(you have ${version}). Run update_local_agent_template, or download it from the ` +
        `Fae portal under Agent templates.`
      );
    } else if (remoteRevision !== null && remoteRevision !== localRevision) {
      console.log(
        `[Fae] Your organization updated its template customizations. ` +
        `Run update_local_agent_template (variant ${variantKey}, version ${version}) to pick them up.`
      );
    }
    process.exit(0);
  })
  .catch(quietExit);
