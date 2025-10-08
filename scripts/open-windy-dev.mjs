#!/usr/bin/env node
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { launch } from 'chrome-launcher';

const DEV_URL = process.argv[2] ?? 'https://windy-plugins.com/dev';
const PROFILE_DIR = path.join(os.tmpdir(), 'windy-plugin-heat-units-chrome-profile');

async function main() {
  console.log('🚀 Launching Chromium-based browser for Windy plugin development...');
  console.log(`   → Target URL: ${DEV_URL}`);
  console.log('   → TLS warnings will be suppressed for this session.');

  let chrome;

  try {
    chrome = await launch({
      startingUrl: DEV_URL,
      chromeFlags: [
        '--ignore-certificate-errors',
        '--allow-running-insecure-content',
        `--user-data-dir=${PROFILE_DIR}`,
        '--no-first-run',
        '--disable-features=TranslateUI',
      ],
    });
  } catch (error) {
    console.error('\n❌ Unable to launch Chrome automatically.');
    console.error('   Make sure that Google Chrome, Chromium, or Microsoft Edge is installed.');
    console.error('   You can still open the URL manually and accept the certificate warning.');
    console.error('   Original error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  console.log(`\n✅ Chrome started (PID: ${chrome.pid}). A dedicated profile directory was created at:`);
  console.log(`   ${PROFILE_DIR}`);
  console.log('   Close the browser window to end the session.');

  try {
    await chrome.waitUntilExit();
  } catch (error) {
    console.error('\n⚠️  Chrome terminated unexpectedly.', error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\n❌ Unexpected error while launching the Windy dev helper.');
  console.error(error);
  process.exit(1);
});
