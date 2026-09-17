// Generates a soft, mottled velvet-style texture (matching the burnt-orange
// fabric swatch reference) used as a background-clip:text fill behind the
// "Xenia" wordmark. Re-runnable — overwrite the base color below and re-run
// `npm run db:generate-texture` any time the reference color changes.
import sharp from "sharp";
import path from "path";

const WIDTH = 512;
const HEIGHT = 512;
const BASE = [181, 82, 40]; // burnt-orange / rust velvet

function clamp(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

async function generate() {
  const buffer = Buffer.alloc(WIDTH * HEIGHT * 3);

  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    // Shared luminance noise per pixel (not independent per channel) so the
    // variation reads as fabric nap/sheen rather than colored static.
    const luminanceNoise = (Math.random() - 0.5) * 46;
    const microNoise = (Math.random() - 0.5) * 10;
    for (let c = 0; c < 3; c++) {
      buffer[i * 3 + c] = clamp(BASE[c] + luminanceNoise + microNoise);
    }
  }

  const outDir = path.join(process.cwd(), "public", "textures");

  await sharp(buffer, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .blur(1.4)
    .png()
    .toFile(path.join(outDir, "wordmark-velvet.png"));

  console.log("Generated public/textures/wordmark-velvet.png");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
