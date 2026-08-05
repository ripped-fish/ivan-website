import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const BUCKET = 'ivan-website-media';
const MEDIA_DOMAIN = 'https://media.ivanpkchan.com';
const SOURCE_DIRECTORY = resolve('Videos');
const STORAGE_GUARD_BYTES = 9_500_000_000;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.status !== 0) {
    const details = options.capture ? `\n${result.stderr || result.stdout}` : '';
    throw new Error(`${command} failed with exit code ${result.status}.${details}`);
  }

  return result.stdout || '';
}

function parseCloudflareSize(value) {
  const match = String(value).trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB|KiB|MiB|GiB|TiB)$/i);
  if (!match) throw new Error(`Could not parse Cloudflare bucket size: ${value}`);

  const units = {
    b: 1,
    kb: 1_000,
    mb: 1_000_000,
    gb: 1_000_000_000,
    tb: 1_000_000_000_000,
    kib: 1_024,
    mib: 1_048_576,
    gib: 1_073_741_824,
    tib: 1_099_511_627_776,
  };

  return Number(match[1]) * units[match[2].toLowerCase()];
}

function formatBytes(bytes) {
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

function objectName(filename) {
  return `${basename(filename, extname(filename))
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.mp4`;
}

if (!existsSync(SOURCE_DIRECTORY)) {
  throw new Error(`Missing source directory: ${SOURCE_DIRECTORY}`);
}

const sourceFiles = readdirSync(SOURCE_DIRECTORY)
  .filter((filename) => extname(filename).toLowerCase() === '.mp4')
  .sort()
  .map((filename) => join(SOURCE_DIRECTORY, filename));

if (sourceFiles.length === 0) {
  throw new Error(`No MP4 files found in ${SOURCE_DIRECTORY}`);
}

const bucketInfoOutput = run(
  'npx',
  ['--yes', 'wrangler@latest', 'r2', 'bucket', 'info', BUCKET, '--json'],
  { capture: true },
);
const bucketInfo = JSON.parse(bucketInfoOutput);
const currentBucketBytes = parseCloudflareSize(bucketInfo.bucket_size);
const sourceBytes = sourceFiles.reduce((total, filepath) => total + statSync(filepath).size, 0);
const projectedBytes = currentBucketBytes + sourceBytes;

// This is intentionally conservative: replacing an existing object is counted as
// additional storage so the uploader always fails safely near the free allowance.
if (projectedBytes > STORAGE_GUARD_BYTES) {
  throw new Error(
    `Upload refused: current bucket plus local videos would reach ${formatBytes(projectedBytes)}, ` +
      `above the ${formatBytes(STORAGE_GUARD_BYTES)} safety limit.`,
  );
}

console.log(
  `Storage guard passed: ${formatBytes(currentBucketBytes)} currently stored + ` +
    `${formatBytes(sourceBytes)} to upload.`,
);

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'ivan-media-upload-'));

try {
  for (const sourceFile of sourceFiles) {
    const key = objectName(sourceFile);
    const uploadFile = join(temporaryDirectory, key);

    if (process.platform === 'darwin' && existsSync('/usr/bin/avconvert')) {
      console.log(`Preparing ${basename(sourceFile)} for fast-start playback...`);
      run('/usr/bin/avconvert', [
        '--source',
        sourceFile,
        '--preset',
        'PresetPassthrough',
        '--output',
        uploadFile,
        '--replace',
      ]);
    } else {
      throw new Error('Fast-start preparation requires macOS avconvert.');
    }

    console.log(`Uploading ${key}...`);
    run('npx', [
      '--yes',
      'wrangler@latest',
      'r2',
      'object',
      'put',
      `${BUCKET}/videos/${key}`,
      '--remote',
      '--file',
      uploadFile,
      '--content-type',
      'video/mp4',
      '--cache-control',
      CACHE_CONTROL,
      '--storage-class',
      'Standard',
      '--force',
    ]);

    console.log(`${MEDIA_DOMAIN}/videos/${key}`);
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
