#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { exit } from 'node:process';

const DEFAULT_URL = 'https://windy-plugins.com/plugins/windy-plugin-heat-units/plugin.json';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 5000;
const LOCAL_PLUGIN_FALLBACK = 'local://plugin.json';

const pluginUrl = process.env.PLUGIN_CHECK_URL ?? DEFAULT_URL;
const retryLimit = Number.parseInt(process.env.PLUGIN_CHECK_RETRIES ?? '', 10) || DEFAULT_RETRIES;
const retryDelayMs = Number.parseInt(process.env.PLUGIN_CHECK_RETRY_DELAY_MS ?? '', 10) || DEFAULT_RETRY_DELAY_MS;
const allowFallbackSuccess = (() => {
  const raw = process.env.PLUGIN_CHECK_ALLOW_FALLBACK_SUCCESS ?? '';
  const normalized = raw.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
})();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeSlugFragment(fragment) {
  if (!fragment || typeof fragment !== 'string') {
    return '';
  }

  return fragment.replace(/[^a-z0-9._-]/gi, '').slice(0, 200);
}

function sanitizeBranchName(branch) {
  if (!branch || typeof branch !== 'string') {
    return '';
  }

  return branch.replace(/[^a-z0-9._\/-]/gi, '').replace(/^\/+/, '').slice(0, 200);
}

function deriveRepositorySlug(repositoryField) {
  if (!repositoryField) {
    return { owner: '', name: '' };
  }

  if (typeof repositoryField === 'string') {
    try {
      const url = new URL(repositoryField);
      const parts = url.pathname.replace(/^\/+/, '').split('/');
      if (parts.length >= 2) {
        return {
          owner: sanitizeSlugFragment(parts[0]),
          name: sanitizeSlugFragment(parts[1].replace(/\.git$/, '')),
        };
      }
    } catch (error) {
      // fall through to returning empty slug
    }
    return { owner: '', name: '' };
  }

  if (repositoryField.url) {
    return deriveRepositorySlug(repositoryField.url);
  }

  if (repositoryField.owner && repositoryField.name) {
    return {
      owner: sanitizeSlugFragment(repositoryField.owner),
      name: sanitizeSlugFragment(repositoryField.name),
    };
  }

  return { owner: '', name: '' };
}

async function loadPackageMetadata() {
  const packageJsonUrl = new URL('../package.json', import.meta.url);
  const packageJsonContent = await readFile(packageJsonUrl, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const { owner, name } = deriveRepositorySlug(packageJson.repository);

  return {
    name: packageJson.name,
    version: packageJson.version,
    repositoryOwner: owner,
    repositoryName: name,
  };
}

async function fetchPluginJson(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'user-agent': 'windy-plugin-uptime-monitor/1.0',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  });

  return response;
}

async function loadLocalPluginMetadata() {
  const localPluginUrl = new URL('../plugin.json', import.meta.url);
  const contents = await readFile(localPluginUrl, 'utf8');
  return JSON.parse(contents);
}

function detectCurrentGitBranch() {
  const envBranchCandidates = [
    process.env.GITHUB_HEAD_REF,
    process.env.GITHUB_REF_NAME,
    process.env.GIT_BRANCH,
    process.env.BUILDKITE_BRANCH,
  ];

  for (const candidate of envBranchCandidates) {
    const sanitized = sanitizeBranchName(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  try {
    const raw = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const sanitized = sanitizeBranchName(raw);
    if (sanitized && sanitized !== 'HEAD') {
      return sanitized;
    }
  } catch (error) {
    // no-op – fall back to default branches
  }

  return '';
}

function buildCandidateUrls(metadata) {
  const urls = [pluginUrl];

  if (metadata.repositoryOwner && metadata.repositoryName) {
    const defaultBranch = sanitizeBranchName(process.env.PLUGIN_CHECK_GITHUB_BRANCH?.trim()) || 'main';
    const candidateBranches = new Set([defaultBranch]);

    const detectedBranch = detectCurrentGitBranch();
    if (detectedBranch) {
      candidateBranches.add(detectedBranch);
    }

    const extraBranches = process.env.PLUGIN_CHECK_GITHUB_BRANCHES?.split(',')
      .map((entry) => sanitizeBranchName(entry.trim()))
      .filter(Boolean);

    if (extraBranches?.length) {
      for (const branch of extraBranches) {
        candidateBranches.add(branch);
      }
    }

    candidateBranches.add('master');

    for (const branch of candidateBranches) {
      const githubUrl = `${GITHUB_RAW_BASE}/${metadata.repositoryOwner}/${metadata.repositoryName}/${branch}/plugin.json`;
      urls.push(githubUrl);
    }
  }

  const extraUrls = process.env.PLUGIN_CHECK_FALLBACK_URLS?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (extraUrls?.length) {
    urls.push(...extraUrls);
  }

  urls.push(LOCAL_PLUGIN_FALLBACK);

  const seen = new Set();
  return urls.filter((url) => {
    if (!url || seen.has(url)) {
      return false;
    }
    seen.add(url);
    return true;
  });
}

function buildPrimaryFailureGuidance(primaryFailure) {
  const message = primaryFailure?.message ?? String(primaryFailure ?? '');
  const lines = [
    '🚨 The Windy Plugins CDN did not serve the expected plugin.json.',
    `   Last error: ${message || '<no error message provided>'}`,
  ];

  if (/NoSuchKey|404/.test(message)) {
    lines.push(
      '   Windy reported that the file does not exist. This usually means the plugin archive has not been uploaded yet or the last upload expired.',
    );
    lines.push('   Run `npm run release` (requires WINDY_API_KEY) or trigger the publish workflow to push a fresh build.');
  } else if (/fetch failed|EAI_AGAIN|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT/i.test(message)) {
    lines.push(
      '   The request failed before reaching Windy. Check your internet connection, VPN/firewall rules, and retry once connectivity is restored.',
    );
  } else if (message) {
    lines.push('   Investigate the error above, resolve it, and rerun the availability check.');
  }

  lines.push(
    '   Set PLUGIN_CHECK_ALLOW_FALLBACK_SUCCESS=1 to suppress this failure when you intentionally rely on fallback sources (for example, during offline development).',
  );

  return lines.join('\n');
}

async function ensurePluginLive() {
  const metadata = await loadPackageMetadata();
  const { name: expectedName, version: expectedVersion } = metadata;
  const candidateUrls = buildCandidateUrls(metadata);
  const errors = [];
  let primaryFailure = null;
  let success = null;

  candidateLoop: for (const url of candidateUrls) {
    for (let attempt = 1; attempt <= retryLimit; attempt += 1) {
      try {
        let payload;

        if (url === LOCAL_PLUGIN_FALLBACK) {
          payload = await loadLocalPluginMetadata();
        } else {
          const response = await fetchPluginJson(url);

          if (!response.ok) {
            const preview = await response.text().catch(() => '');
            throw new Error(
              `Received HTTP ${response.status} ${response.statusText}. Response preview: ${preview.slice(0, 200)}`,
            );
          }

          payload = await response.json();
        }

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

        success = { url, payload };
        break candidateLoop;
      } catch (error) {
        if (url === LOCAL_PLUGIN_FALLBACK) {
          errors.push({ url, error });
          break;
        }

        const attemptMessage = `Attempt ${attempt} of ${retryLimit} failed for ${url}: ${error.message ?? error}`;
        console.error(`❌ ${attemptMessage}`);

        if (attempt < retryLimit) {
          console.error(`Waiting ${retryDelayMs}ms before retrying...`);
          await sleep(retryDelayMs);
        } else {
          errors.push({ url, error });
          if (url === pluginUrl && !primaryFailure) {
            primaryFailure = error;
          }
        }
      }
    }
  }

  if (!success) {
    const errorMessages = errors.map(({ url, error }) => `• ${url}: ${error.message ?? error}`).join('\n');
    throw new Error(
      `Unable to confirm plugin availability from any source.\nTried the following URLs:\n${errorMessages || '<none>'}`,
    );
  }

  const { url: successUrl, payload: successPayload } = success;
  const successPrefix = successUrl === pluginUrl ? '✅' : '⚠️';
  const successMessage =
    successUrl === pluginUrl
      ? `${successUrl} is online and serves version ${successPayload.version}.`
      : successUrl === LOCAL_PLUGIN_FALLBACK
        ? 'Local plugin.json matched the expected metadata (used as offline fallback).'
        : `${successUrl} responded with the expected plugin metadata (used as fallback).`;
  console.log(`${successPrefix} ${successMessage}`);

  if (successUrl === pluginUrl) {
    return;
  }

  console.log('ℹ️ Primary CDN was unreachable; verify the Windy Plugins upload and propagation status separately.');

  if (primaryFailure) {
    const guidance = buildPrimaryFailureGuidance(primaryFailure);
    if (guidance) {
      console.warn(guidance);
    }
  }

  if (!allowFallbackSuccess) {
    const guidance =
      buildPrimaryFailureGuidance(primaryFailure) ||
      'Primary CDN unavailable and no diagnostic information was captured.';
    const error = new Error(guidance);
    if (primaryFailure) {
      error.cause = primaryFailure;
    }
    throw error;
  }

  if (!primaryFailure) {
    console.warn(
      '⚠️ No diagnostic details were captured for the primary CDN failure. Inspect the console output above for potential clues.',
    );
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
