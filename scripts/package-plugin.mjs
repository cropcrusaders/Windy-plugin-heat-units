import { access, cp, mkdir, mkdtemp, readdir, rm, stat, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');
const pluginJsonPath = path.join(repoRoot, 'plugin.json');
const tarPath = path.join(repoRoot, 'windy-plugin-heat-units.tar');

const ensureFile = async (filePath, message) => {
  try {
    await access(filePath);
  } catch (error) {
    throw new Error(message);
  }
};

const main = async () => {
  await ensureFile(pluginJsonPath, 'plugin.json is missing. Run npm install to restore it.');
  await ensureFile(distDir, 'dist directory is missing. Run "npm run build:prod" before packaging.');

  const files = await readdir(distDir);
  if (files.length === 0) {
    throw new Error('dist directory is empty. Build the plugin before packaging.');
  }

  const plugin = JSON.parse(await readFile(pluginJsonPath, 'utf8'));
  if (plugin && typeof plugin.main === 'string') {
    const mainPath = path.join(repoRoot, plugin.main);
    await ensureFile(
      mainPath,
      `The entry file declared in plugin.json ("${plugin.main}") is missing. Did the build complete successfully?`,
    );
  }

  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'windy-plugin-'));
  const payloadDir = path.join(tempRoot, 'payload');

  try {
    await rm(tarPath, { force: true });
    await mkdir(payloadDir, { recursive: true });
    await cp(pluginJsonPath, path.join(payloadDir, 'plugin.json'), { recursive: false });
    await cp(distDir, path.join(payloadDir, 'dist'), { recursive: true });

    await execFileAsync('tar', ['-C', payloadDir, '-cf', tarPath, '.']);
    const archiveStat = await stat(tarPath);
    if (!archiveStat.isFile() || archiveStat.size === 0) {
      throw new Error('Failed to create plugin archive. The resulting file is empty.');
    }

    console.log(`📦 Created plugin archive at ${tarPath} (${archiveStat.size} bytes)`);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
};

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
