#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pkgPath = path.join(rootDir, 'package.json');
const pluginPath = path.join(rootDir, 'plugin.json');
const distPath = path.join(rootDir, 'dist', 'plugin.js');

function incrementPatch(version) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Unsupported version format: ${version}`);
  }
  parts[2] += 1;
  return parts.join('.');
}

async function updateJsonVersion(filePath, newVersion) {
  const raw = await readFile(filePath, 'utf8');
  const data = JSON.parse(raw);
  data.version = newVersion;
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

async function updateDistVersion(filePath, newVersion) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const updated = raw.replace(/(version:\s*['"]).*?(['"])/, `$1${newVersion}$2`);
    if (raw === updated) {
      console.warn(`⚠️ No version placeholder found in ${filePath}`);
    } else {
      await writeFile(filePath, updated);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`ℹ️ Skipping ${filePath} because it does not exist.`);
    } else {
      throw error;
    }
  }
}

async function main() {
  const pkgRaw = await readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw);
  const currentVersion = pkg.version;
  if (!currentVersion) {
    throw new Error('No version found in package.json');
  }
  const newVersion = incrementPatch(currentVersion);
  console.log(`Bumping version: ${currentVersion} -> ${newVersion}`);

  await updateJsonVersion(pkgPath, newVersion);
  await updateJsonVersion(pluginPath, newVersion);
  await updateDistVersion(distPath, newVersion);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
