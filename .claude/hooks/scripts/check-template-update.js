#!/usr/bin/env node

/**
 * Wizardworks Hook: Agent Template Update Check (Epic #1978, #1983)
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
  quietExit(); // not a downloaded bundle — nothing to check
}

const { variantKey, version, gatewayBaseUrl } = meta || {};
if (!variantKey || !version || !gatewayBaseUrl) quietExit();

const url = `${gatewayBaseUrl.replace(/\/+$/, '')}/api/client/agent-templates/${encodeURIComponent(variantKey)}/latest`;

fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  .then((res) => (res.ok ? res.json() : null))
  .then((latest) => {
    if (!latest || !latest.version) quietExit();
    if (latest.version !== version) {
      console.log(
        `[Fae] A newer version of this agent template is available: ${latest.version} ` +
        `(you have ${version}). Download it from the Fae portal under Agent templates ` +
        `to get the latest rules, agents and hooks.`
      );
    }
    process.exit(0);
  })
  .catch(quietExit);
