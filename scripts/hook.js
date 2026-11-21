#!/usr/bin/env node
/**
 * Hook adapter for Antigravity Swarm Cosmetics.
 * Reads hook JSON from stdin and returns valid protojson response to stdout,
 * while executing patcher silently.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main() {
  let inputData = '';
  try {
    inputData = fs.readFileSync(0, 'utf-8');
  } catch (e) {
    // stdin empty
  }

  let eventName = '';
  try {
    if (inputData) {
      const parsed = JSON.parse(inputData);
      eventName = parsed.hookEventName || '';
    }
  } catch (e) {}

  // Run patch silently
  try {
    const patchScript = path.join(__dirname, 'patch.js');
    spawnSync(process.execPath, [patchScript, 'apply', '--silent'], {
      stdio: ['ignore', 'pipe', 'inherit'],
    });
  } catch (err) {
    // Do not crash hook
  }

  // Output required protojson contract
  if (eventName === 'PreToolUse') {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  } else {
    process.stdout.write('{}');
  }
}

main();
