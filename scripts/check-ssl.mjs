#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const targets = [
  'src',
  'scripts',
  'dist',
  'plugin.json',
  'package.json',
  'README.md',
  'rollup.config.js',
  'tsconfig.json',
  '.github/workflows',
];

const ignoredDirectories = new Set(['.git', 'node_modules']);
const allowedExtensions = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.svelte',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.tsconfig',
  '.config',
  '.txt',
  '.lock',
]);

const ignoredFiles = new Set(['scripts/check-ssl.mjs']);

const allowedHttpPatterns = [
  /http:\/\/localhost(?::\d+)?/i,
  /http:\/\/127\.0\.0\.1(?::\d+)?/i,
];

function isAllowedHttp(line) {
  return allowedHttpPatterns.some((pattern) => pattern.test(line));
}

async function collectFiles(relativePath) {
  const resolvedPath = path.join(repoRoot, relativePath);
  let stats;
  try {
    stats = await stat(resolvedPath);
  } catch (error) {
    return [];
  }

  if (stats.isFile()) {
    const ext = path.extname(resolvedPath);
    const relative = path.relative(repoRoot, resolvedPath);
    if (ignoredFiles.has(relative)) {
      return [];
    }
    if (ext && !allowedExtensions.has(ext)) {
      return [];
    }
    return [resolvedPath];
  }

  if (stats.isDirectory()) {
    const entries = await readdir(resolvedPath, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }
      const nestedRelativePath = path.join(relativePath, entry.name);
      const nestedFiles = await collectFiles(nestedRelativePath);
      files.push(...nestedFiles);
    }
    return files;
  }

  return [];
}

async function findInsecureReferences() {
  const filesToCheck = new Set();
  for (const target of targets) {
    const entries = await collectFiles(target);
    entries.forEach((entry) => filesToCheck.add(entry));
  }

  const violations = [];

  for (const filePath of filesToCheck) {
    const relativePath = path.relative(repoRoot, filePath);
    const content = await readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (line.includes('http://') && !isAllowedHttp(line)) {
        violations.push({
          file: relativePath,
          line: index + 1,
          content: line.trim(),
        });
      }
    });
  }

  return violations;
}

async function main() {
  const violations = await findInsecureReferences();

  if (violations.length > 0) {
    console.error('❌ Detected non-SSL (http://) references that are not allowed.');
    violations.forEach((violation) => {
      console.error(`  - ${violation.file}:${violation.line} → ${violation.content}`);
    });
    console.error('\nReplace these URLs with HTTPS endpoints or add explicit exceptions to the allow-list if they are safe.');
    process.exit(1);
  }

  console.log('✅ SSL enforcement check passed. No insecure http:// references were found.');
}

main().catch((error) => {
  console.error('Unexpected error while running SSL enforcement check.');
  console.error(error);
  process.exit(1);
});
