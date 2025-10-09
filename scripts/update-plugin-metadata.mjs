import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginPath = path.resolve(__dirname, '../plugin.json');

const loadJson = async () => {
  const raw = await readFile(pluginPath, 'utf8');
  return JSON.parse(raw);
};

const saveJson = async (data) => {
  const json = JSON.stringify(data, null, 2);
  await writeFile(pluginPath, `${json}\n`);
};

const safeExec = (command) => {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
};

const deriveSlugFromUrl = (remoteUrl) => {
  if (!remoteUrl) {
    return '';
  }

  try {
    if (remoteUrl.startsWith('git@')) {
      const match = remoteUrl.match(/:(.+?)(?:\.git)?$/);
      return match ? match[1] : '';
    }

    const url = new URL(remoteUrl);
    const pathname = url.pathname.replace(/^\/+|\.git$/g, '');
    return pathname;
  } catch (error) {
    return '';
  }
};

const resolveRepoSlug = (repositoryField) => {
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }

  const remoteUrl = safeExec('git config --get remote.origin.url');
  const derivedFromRemote = deriveSlugFromUrl(remoteUrl);
  if (derivedFromRemote) {
    return derivedFromRemote;
  }

  if (typeof repositoryField === 'string') {
    return deriveSlugFromUrl(repositoryField);
  }

  if (repositoryField && typeof repositoryField.url === 'string') {
    return deriveSlugFromUrl(repositoryField.url);
  }

  return '';
};

const now = new Date();
const timestamp = now.getTime();
const isoString = now.toISOString();

const commitSha = (process.env.GITHUB_SHA || safeExec('git rev-parse HEAD')).slice(0, 40);
const plugin = await loadJson();
const repoSlug = resolveRepoSlug(plugin.repository);
const [repositoryOwner = '', repositoryName = ''] = repoSlug.split('/');
plugin.built = Number.isFinite(timestamp) ? Math.trunc(timestamp) : Date.now();
plugin.builtReadable = isoString.length <= 200 ? isoString : isoString.slice(0, 200);
if (commitSha) {
  plugin.commitSha = commitSha;
}
if (repositoryOwner) {
  plugin.repositoryOwner = repositoryOwner.slice(0, 200);
}
if (repositoryName) {
  plugin.repositoryName = repositoryName.slice(0, 200);
}

await saveJson(plugin);

console.log('✅ plugin.json metadata updated');
