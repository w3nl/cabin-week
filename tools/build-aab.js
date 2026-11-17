const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { setTimeout: delay } = require('timers/promises');

const root = path.resolve(__dirname, '..');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit'
  });
  if (result.error) {
    if (result.error.code === 'ENOENT')
      throw new Error(`Could not find "${command}". Install it and try again.`);
    throw result.error;
  }
  if (result.status !== 0) {
    const details = options.capture ? result.stderr.trim() : '';
    throw new Error(`${command} exited with status ${result.status}${details ? `: ${details}` : ''}`);
  }
  return options.capture ? result.stdout : '';
}

async function findDispatchedRun(startedAt) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const output = run('gh', [
      'run', 'list', '--workflow', 'google-tv.yml', '--branch', 'main',
      '--event', 'workflow_dispatch', '--limit', '10',
      '--json', 'databaseId,createdAt'
    ], { capture: true });
    const runs = JSON.parse(output);
    const matchingRun = runs.find(item => Date.parse(item.createdAt) >= startedAt - 2_000);
    if (matchingRun) return matchingRun.databaseId;
    await delay(2_000);
  }
  throw new Error('Could not find the new workflow run. Check GitHub Actions and try again.');
}

async function main() {
  run('gh', ['auth', 'status']);

  const startedAt = Date.now();
  run('gh', ['workflow', 'run', 'google-tv.yml', '--ref', 'main']);
  const runId = await findDispatchedRun(startedAt);

  run('gh', ['run', 'watch', String(runId), '--exit-status']);

  const outputDir = path.join(root, 'dist', `android-aab-${runId}`);
  fs.mkdirSync(outputDir, { recursive: true });
  run('gh', [
    'run', 'download', String(runId),
    '--name', 'cabin-week-google-play',
    '--dir', outputDir
  ]);

  const archive = path.join(outputDir, 'cabin-week-google-play.7z');
  if (!fs.existsSync(archive))
    throw new Error(`The workflow artifact did not contain ${path.basename(archive)}.`);

  console.log('\nEnter your keystore password when 7-Zip prompts:');
  run('7z', ['x', archive, `-o${outputDir}`]);

  const bundle = path.join(outputDir, 'cabin-week.aab');
  if (!fs.existsSync(bundle))
    throw new Error('Extraction finished, but cabin-week.aab was not found.');

  console.log(`\nAAB ready: ${path.relative(root, bundle)}`);
}

main().catch(error => {
  console.error(`\nAAB build failed: ${error.message}`);
  process.exitCode = 1;
});
