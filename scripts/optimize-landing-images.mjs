/**
 * Comprime PNG de public/landing/ in-place (solo si el resultado es más liviano).
 * Uso: pnpm optimize:landing-images
 */
import sharp from "sharp";
import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const LANDING_DIR = join(process.cwd(), "public", "landing");
const MAX_WIDTH = 1400;

async function optimizePng(filePath) {
  const before = statSync(filePath).size;
  const buffer = await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .png({ quality: 82, compressionLevel: 9, palette: true })
    .toBuffer();

  if (buffer.length >= before) {
    console.log(`  kept  ${Math.round(before / 1024)} KB  ${filePath}`);
    return;
  }

  const tempPath = `${filePath}.opt.tmp`;
  await sharp(buffer).toFile(tempPath);
  try {
    unlinkSync(filePath);
  } catch {
    // ignore
  }
  renameSync(tempPath, filePath);

  console.log(
    `  saved ${Math.round(before / 1024)} KB → ${Math.round(buffer.length / 1024)} KB  ${filePath}`,
  );
}

async function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (entry.name.endsWith(".png")) {
      await optimizePng(full);
    }
  }
}

console.log(`Optimizing PNGs under ${LANDING_DIR}…`);
await walk(LANDING_DIR);
console.log("Done.");
