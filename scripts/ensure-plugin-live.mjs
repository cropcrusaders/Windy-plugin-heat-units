#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

const DEFAULT_URL = 'https://windy-plugins.com/plugins/windy-plugin-heat-units/plugin.json';
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 5000;

const pluginUrl = process.env.PLUGIN_CHECK_URL ?? DEFAULT_URL;
const retryLimit = Number.parseInt(process.env.PLUGIN_CHECK_RETRIES ?? '', 10) || DEFAULT_RETRIES;
const retryDelayMs = Number.parseInt(process.env.PLUGIN_CHECK_RETRY_DELAY_MS ?? '', 10) || DEFAULT_RETRY_DELAY_MS;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadPackageMetadata() {
  const packageJsonUrl = new URL('../package.json', import.meta.url);
  const packageJsonContent = await readFile(packageJsonUrl, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  return {
    name: packageJson.name,
    version: packageJson.version,
  };
}

async function fetchPluginJson() {
  const response = await fetch(pluginUrl, {
    method: 'GET',
    headers: {
      'user-agent': 'windy-plugin-uptime-monitor/1.0',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  });

  return response;
}

async function ensurePluginLive() {
  const { name: expectedName, version: expectedVersion } = await loadPackageMetadata();

  for (let attempt = 1; attempt <= retryLimit; attempt += 1) {
    try {
      const response = await fetchPluginJson();

      if (!response.ok) {
        const preview = await response.text().catch(() => '');
        throw new Error(`Received HTTP ${response.status} ${response.statusText}. Response preview: ${preview.slice(0, 200)}`);
      }

      const payload = await response.json();

      if (!payload || typeof payload !== 'object') {
        throw new Error('Plugin metadata response was empty or not JSON.');
      }

      if (payload.name !== expectedName) {
        throw new Error(`Expected plugin name "${expectedName}" but received "${payload.name}".`);
      }

      if (payload.version !== expectedVersion) {
        throw new Error(
          `Remote plugin version ${payload.version ?? '<unknown>'} does not match package.json version ${expectedVersion}.`,
        );
      }

      console.log(`✅ ${pluginUrl} is online and serves version ${payload.version}.`);
      return;
    } catch (error) {
      const attemptMessage = `Attempt ${attempt} of ${retryLimit} failed: ${error.message ?? error}`;
      console.error(`❌ ${attemptMessage}`);

      if (attempt < retryLimit) {
        console.error(`Waiting ${retryDelayMs}ms before retrying...`);
        await sleep(retryDelayMs);
      } else {
        throw error;
      }
    }
  }
}

ensurePluginLive()
  .then(() => exit(0))
  .catch((error) => {
    console.error('Plugin availability check failed.');
    if (error?.stack) {
      console.error(error.stack);
    }
    exit(1);
  });
