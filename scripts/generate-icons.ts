// One-off (and re-runnable) generator for placeholder PWA icons in the
// brand palette. Swap for real branded artwork whenever you have it —
// just overwrite public/icons/*.png, no code changes needed.
import sharp from "sharp";
import path from "path";

const TEAL = "#1C8C7C";
const CORAL = "#FF6B4A";
const GOLD = "#CFA125";

// A simple compass/pin mark: a coral pin body with a gold ring, on a teal field.
function markSvg(size: number, { fullBleed }: { fullBleed: boolean }) {
  const pad = fullBleed ? size * 0.22 : size * 0.14;
  const inner = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${TEAL}"/>
  <g transform="translate(${cx} ${cy})">
    <circle r="${inner * 0.34}" fill="none" stroke="${GOLD}" stroke-width="${inner * 0.06}"/>
    <path d="M0 ${-inner * 0.3} L${inner * 0.16} ${inner * 0.14} L0 ${inner * 0.04} L${-inner * 0.16} ${inner * 0.14} Z" fill="${CORAL}"/>
  </g>
</svg>`;
}

async function generate() {
  const outDir = path.join(process.cwd(), "public", "icons");

  await sharp(Buffer.from(markSvg(192, { fullBleed: false })))
    .png()
    .toFile(path.join(outDir, "icon-192.png"));

  await sharp(Buffer.from(markSvg(512, { fullBleed: false })))
    .png()
    .toFile(path.join(outDir, "icon-512.png"));

  await sharp(Buffer.from(markSvg(512, { fullBleed: true })))
    .png()
    .toFile(path.join(outDir, "icon-maskable-512.png"));

  console.log("Generated icon-192.png, icon-512.png, icon-maskable-512.png in public/icons/");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
