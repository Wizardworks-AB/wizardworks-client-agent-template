#!/usr/bin/env node

/**
 * Workflow gate (Stop).
 *
 * You cannot END A TURN having changed source code without the required
 * reviews having actually run — and, inside a flow, without the code having
 * been verified after it was last written.
 *
 *   always         source changed, no code-reviewer/architect  -> block
 *   always         surface path changed, no security-reviewer  -> block
 *   in a flow      source changed after the last test run      -> block
 *
 * Exit 2 tells Claude Code not to stop and feeds stderr to the agent. Two
 * independent loop guards, because a Stop hook that can trap a session is worse
 * than no hook: `stop_hook_active` (set when the agent is already continuing
 * because of a Stop hook) is honoured, AND the gate blocks at most MAX_BLOCKS
 * times per session regardless. One or two extra turns, never a loop: if the
 * requirement genuinely does not apply the agent says why and stops again.
 *
 * Fails open on any error.
 */

const path = require('path');
const S = require('./flow-state');

const CODE_REVIEWERS = ['code-reviewer', 'architect'];
const SECURITY_REVIEWERS = ['security-reviewer'];
const MAX_BLOCKS = 2;

function main() {
  const event = S.readEvent();
  if (!event) return 0;
  if (event.stop_hook_active === true) return 0;

  const sessionId = typeof event.session_id === 'string' ? event.session_id : '';
  if (!sessionId) return 0;

  const facts = S.gitFacts(typeof event.cwd === 'string' ? event.cwd : process.cwd());
  if (!facts) return 0;

  const state = S.readState(facts.commonDir);
  const entry = state[sessionId];
  if (!entry || typeof entry !== 'object') return 0;
  if (Number(entry.gateBlocks) >= MAX_BLOCKS) return 0; // never trap a session

  const code = Array.isArray(entry.code) ? entry.code : [];
  const agents = Array.isArray(entry.agents) ? entry.agents : [];
  if (code.length === 0) return 0;

  const missing = [];
  if (!agents.some((a) => CODE_REVIEWERS.includes(a))) {
    missing.push({
      what: 'a code review',
      how: 'run `/code-review` — it spawns the **code-reviewer** agent; spawn the agent, do not review inline',
    });
  }
  if (entry.surface === true && !agents.some((a) => SECURITY_REVIEWERS.includes(a))) {
    missing.push({
      what: 'a security review',
      how: 'run `/security-review` — it spawns the **security-reviewer** agent',
    });
  }
  const inFlow = Boolean(entry.mode);
  if (inFlow && Number(entry.lastCode) > Number(entry.lastVerify)) {
    missing.push({
      what: 'local verification',
      how: 'run the test suite (and exercise the real path) AFTER the last change — the last source write is newer than the last test run',
    });
  }
  if (missing.length === 0) return 0;

  const shown = code.slice(0, 8).map((p) => `  - ${path.relative(facts.topLevel, p) || path.basename(p)}`).join('\n');
  const more = code.length > 8 ? `\n  …and ${code.length - 8} more` : '';

  process.stderr.write(
    `Workflow gate: ${code.length} source file(s) changed this session without ${missing
      .map((m) => m.what)
      .join(', ')}.\n` +
      `\n${shown}${more}\n` +
      `\n${missing.map((m) => `Required: ${m.how}.`).join('\n')}\n` +
      (entry.surface
        ? `\nOne of these paths is on the security-sensitive surface (auth, secrets,\n` +
          `migrations, infrastructure, dependencies or tenant isolation), which is why\n` +
          `the security review is required and not optional.\n`
        : '') +
      `\nThis is rules/workflow.md enforced rather than suggested. If a requirement\n` +
      `genuinely does not apply here, say why and finish — this gate will not ask\n` +
      `again in this stop sequence.\n`
  );
  entry.gateBlocks = Number(entry.gateBlocks || 0) + 1;
  S.writeState(facts.commonDir, state);
  return 2;
}

try {
  process.exit(main());
} catch {
  process.exit(0);
}
