#!/usr/bin/env node
import { exit } from 'node:process';

const DEFAULT_URL = 'https://windy-plugins.com/plugins/windy-plugin-heat-units/plugin.json';
const url = process.argv[2] ?? DEFAULT_URL;

async function fetchWithTimeout(method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { method, signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function main() {
  let lastNetworkError;

  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetchWithTimeout(method);
      if (response.ok) {
        console.log(`✅ ${url} is reachable (HTTP ${response.status}) via ${method}.`);
        exit(0);
      }

      let bodySnippet = '';
      try {
        const text = await response.text();
        bodySnippet = text.slice(0, 200);
      } catch (readError) {
        bodySnippet = `<unable to read body: ${readError.message ?? readError}>`;
      }

      console.error(`❌ Received HTTP ${response.status} ${response.statusText} when requesting ${url} with ${method}.`);
      if (bodySnippet.includes('NoSuchKey')) {
        console.error('The server reports "NoSuchKey"—the upload has not propagated or the path is incorrect.');
      } else if (bodySnippet) {
        console.error(`Response preview: ${bodySnippet}`);
      }

      if (method === 'HEAD' && response.status === 405) {
        console.error('The server rejected HEAD requests; retrying with GET...');
        continue;
      }

      exit(1);
    } catch (error) {
      lastNetworkError = error;
      if (error.name === 'AbortError') {
        console.error(`❌ Timed out after 5s while trying to reach ${url} with ${method}.`);
      } else {
        const message = error.message ?? String(error);
        console.error(`❌ Network error while requesting ${url} with ${method}: ${message}`);
      }

      if (method === 'HEAD') {
        console.error('Retrying with GET to gather more details...');
        continue;
      }

      console.error('Double-check your internet connection and ensure the plugin was released.');
      exit(1);
    }
  }

  if (lastNetworkError) {
    console.error('Unable to reach the plugin URL after multiple attempts.');
    console.error('Double-check your internet connection and ensure the plugin was released.');
  }
  exit(1);
}

main();
