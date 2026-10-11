import { readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';

const [sourcePath, outputPath] = process.argv.slice(2);
const vector = await readFile(sourcePath, 'utf8');
if (!vector.includes('fill="black"')) throw new Error('Expected the supplied black logo vector');
const glyph = await sharp(Buffer.from(vector.replace('fill="black"', 'fill="white"')))
  .resize(384, 384).png().toBuffer();
await mkdir(dirname(outputPath), { recursive: true });
// The upstream additive texture uses a white glyph on opaque black. Preserve
// its 24 / 32 foreground ratio so the camera track retains the same footprint.
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#000000' } })
  .composite([{ input: glyph, left: 64, top: 64 }])
  .png({ compressionLevel: 9, adaptiveFiltering: false }).toFile(outputPath);
