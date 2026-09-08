#!/usr/bin/env node

/**
 * Flow tracker (PostToolUse).
 *
 * Records what actually happened in a session so the gates can enforce the
 * workflow instead of asking for it in prose:
 *
 *   Write/Edit/MultiEdit/NotebookEdit  -> which source files changed, and
 *                                         whether any is on the security surface
 *   Task/Agent                         -> which specialist agents were spawned
 *   TodoWrite                          -> the task list exists
 *   mcp__*__remember (type: plan)      -> scope and acceptance criteria recorded
 *   Bash running a test runner         -> the code was verified after being written
 *
 * State lives in the repo's own .git (see flow-state.js). Always exits 0 —
 * this script observes; it never blocks anything.
 */

const path = require('path');
const S = require('./flow-state');

function main() {
  const event = S.readEvent();
  if (!event) return;
  const sessionId = typeof event.session_id === 'string' ? event.session_id : '';
  if (!sessionId) return;

  const tool = typeof event.tool_name === 'string' ? event.tool_name : '';
  const input = event.tool_input && typeof event.tool_input === 'object' ? event.tool_input : {};

  let codeFile = null;
  let agent = null;
  let todo = false;
  let plan = false;
  let verify = false;

  if (tool === 'Write' || tool === 'Edit' || tool === 'MultiEdit' || tool === 'NotebookEdit') {
    const filePath = input.file_path ?? input.notebook_path;
    if (S.isCode(filePath)) codeFile = filePath;
  } else if (tool === 'Task' || tool === 'Agent') {
    if (typeof input.subagent_type === 'string') agent = input.subagent_type;
  } else if (tool === 'TodoWrite') {
    todo = Array.isArray(input.todos) ? input.todos.length > 0 : true;
  } else if (/^mcp__.+__remember$/.test(tool)) {
    plan = input.type === 'plan';
  } else if (tool === 'Bash') {
    verify = S.isTestRun(input.command);
  }
  if (!codeFile && !agent && !todo && !plan && !verify) return;

  const anchor = codeFile ? path.dirname(path.resolve(codeFile)) : process.cwd();
  const facts = S.gitFacts(anchor) ?? S.gitFacts(process.cwd());
  if (!facts) return; // not in a repo — nothing to gate

  const state = S.readState(facts.commonDir);
  const entry = S.session(state, sessionId);
  const now = Date.now();

  if (codeFile) {
    const abs = path.resolve(codeFile);
    if (!entry.code.includes(abs) && entry.code.length < 500) entry.code.push(abs);
    if (S.onSurface(abs)) entry.surface = true;
    entry.lastCode = now;
  }
  if (agent && !entry.agents.includes(agent)) entry.agents.push(agent);
  if (todo) entry.todo = true;
  if (plan) entry.plan = true;
  if (verify) entry.lastVerify = now;

  S.writeState(facts.commonDir, state);
}

try {
  main();
} catch {
  /* observability must never break the session */
}
process.exit(0);
