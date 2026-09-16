#!/usr/bin/env node

/**
 * Ask gate (Stop).
 *
 * You cannot END A TURN having asked the user a question in running prose.
 * rules/asking-the-user.md says every question is a choice with options — on
 * Claude Code, the AskUserQuestion tool. This gate reads the turn that is
 * ending from the transcript and blocks when the assistant's own text asks
 * something and no AskUserQuestion call was made in that turn.
 *
 *   text asks a question, no AskUserQuestion this turn  -> block (exit 2)
 *   AskUserQuestion was called this turn                 -> stop normally
 *   no question in the text                              -> stop normally
 *
 * Same loop guards as flow-gate: `stop_hook_active` is honoured and the gate
 * blocks at most MAX_BLOCKS times per session. A rhetorical question costs one
 * extra turn at most — the agent says so and stops again. Fails open on any
 * error, including a missing, unreadable or unexpectedly shaped transcript.
 */

const fs = require('fs');
const S = require('./flow-state');

const MAX_BLOCKS = 2;
const TAIL_BYTES = 4 * 1024 * 1024; // the ending turn is at the end of the file
const ASK_TOOL = 'AskUserQuestion';

/**
 * The turn that is ending: the assistant's text and tool names since the last
 * human message. Tool results also arrive as `type: "user"` entries; they do
 * not start a turn. Sidechain entries belong to subagents and are skipped.
 */
function lastTurn(transcriptPath) {
  let text = [];
  let tools = [];
  for (const line of readTail(transcriptPath)) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (!entry || typeof entry !== 'object' || entry.isSidechain === true) continue;
    const content = entry.message && entry.message.content;
    if (entry.type === 'user') {
      if (isHumanMessage(content)) {
        text = [];
        tools = [];
      }
      continue;
    }
    if (entry.type !== 'assistant' || !Array.isArray(content)) continue;
    for (const block of content) {
      if (!block || typeof block !== 'object') continue;
      if (block.type === 'text' && typeof block.text === 'string') text.push(block.text);
      else if (block.type === 'tool_use' && typeof block.name === 'string') tools.push(block.name);
    }
  }
  return { text: text.join('\n'), tools };
}

/** A human message is a string, or text blocks without a tool_result among them. */
function isHumanMessage(content) {
  if (typeof content === 'string') return true;
  if (!Array.isArray(content)) return false;
  return content.some((b) => b && b.type === 'text') && !content.some((b) => b && b.type === 'tool_result');
}

function readTail(file) {
  const size = fs.statSync(file).size;
  const start = Math.max(0, size - TAIL_BYTES);
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    const lines = buf.toString('utf8').split('\n');
    if (start > 0) lines.shift(); // the first line is partial
    return lines;
  } finally {
    fs.closeSync(fd);
  }
}

/** Does the prose ask a question? Code and URLs are not prose; link text and quotes are. */
function asksAQuestion(text) {
  const prose = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/\bhttps?:\/\/\S+/g, ' ');
  return /\?(?=[\s*_)\]"'”»]|$)/m.test(prose);
}

function main() {
  const event = S.readEvent();
  if (!event) return 0;
  if (event.stop_hook_active === true) return 0;

  const sessionId = typeof event.session_id === 'string' ? event.session_id : '';
  const transcript = typeof event.transcript_path === 'string' ? event.transcript_path : '';
  if (!sessionId || !transcript || !fs.existsSync(transcript)) return 0;

  const turn = lastTurn(transcript);
  if (turn.tools.includes(ASK_TOOL)) return 0;
  if (!asksAQuestion(turn.text)) return 0;

  const facts = S.gitFacts(typeof event.cwd === 'string' ? event.cwd : process.cwd());
  if (!facts) return 0;
  const state = S.readState(facts.commonDir);
  const entry = S.session(state, sessionId);
  if (Number(entry.askBlocks) >= MAX_BLOCKS) return 0; // never trap a session

  process.stderr.write(
    `Ask gate: your last message asks the user something in running prose, and no\n` +
      `AskUserQuestion call was made this turn.\n` +
      `\nAsk it as a choice: two to four concrete options, one recommended and first,\n` +
      `"Chat about this" last, each labelled with what happens if it is chosen\n` +
      `(rules/asking-the-user.md). Keep the questions in that one block — the report\n` +
      `that supports them is separate (rules/writing.md).\n` +
      `\nThis is the rule enforced rather than suggested. If the question mark was\n` +
      `rhetorical or quoted, say so and finish — this gate will not ask again in this\n` +
      `stop sequence.\n`
  );
  entry.askBlocks = Number(entry.askBlocks || 0) + 1;
  S.writeState(facts.commonDir, state);
  return 2;
}

try {
  process.exit(main());
} catch {
  process.exit(0);
}
