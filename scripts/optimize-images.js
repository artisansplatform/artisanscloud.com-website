#!/usr/bin/env node
import { statSync, renameSync, unlinkSync } from 'node:fs';
import { extname, dirname, basename, join, relative } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npm run optimize:images -- <path> [<path>...]');
  console.error('');
  console.error('Tip: run `npm run check:images` first to see which files need attention.');
  process.exit(1);
}

const RASTER_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function optimizeOne(input) {
  const ext = extname(input).toLowerCase();

  if (ext === '.svg') {
    console.log(`skip  ${input}  (SVGs not auto-optimized, see check output)`);
    return;
  }
  if (!RASTER_EXTS.has(ext)) {
    console.log(`skip  ${input}  (unsupported extension)`);
    return;
  }

  const beforeBytes = statSync(input).size;
  const tmp = join(dirname(input), `.${basename(input)}.tmp`);

  let pipeline = sharp(input);

  if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 80, effort: 6 });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  }

  try {
    await pipeline.toFile(tmp);
  } catch (err) {
    console.error(`fail  ${input}  (${err.message})`);
    try { unlinkSync(tmp); } catch {}
    return;
  }

  const afterBytes = statSync(tmp).size;

  if (afterBytes >= beforeBytes) {
    unlinkSync(tmp);
    console.log(`keep  ${input}  (already optimal: ${(beforeBytes / 1024).toFixed(0)} KB)`);
    return;
  }

  renameSync(tmp, input);
  const savedKB = (beforeBytes - afterBytes) / 1024;
  const pct = ((1 - afterBytes / beforeBytes) * 100).toFixed(0);
  console.log(
    `ok    ${input}  ${(beforeBytes / 1024).toFixed(0)} KB → ${(afterBytes / 1024).toFixed(0)} KB  (-${savedKB.toFixed(0)} KB, -${pct}%)`
  );
}

for (const arg of args) {
  const rel = relative(process.cwd(), arg);
  await optimizeOne(rel || arg);
}
