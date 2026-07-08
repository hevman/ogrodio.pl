import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const leafPath = path.join(root, "public", "brand", "ogrodio-leaf.jpg");

if (!fs.existsSync(leafPath)) {
  console.error("Missing public/brand/ogrodio-leaf.jpg — run GenerateImage first or place the file manually.");
  process.exit(1);
}

const outputs = [
  { file: "public/apple-icon.png", size: 180 },
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
  { file: "public/favicon-32.png", size: 32 },
  { file: "public/favicon-48.png", size: 48 },
  { file: "public/favicon.png", size: 48 },
  { file: "src/app/icon.png", size: 32 },
  { file: "src/app/apple-icon.png", size: 180 },
];

for (const { file, size } of outputs) {
  const out = path.join(root, file);
  await sharp(leafPath)
    .resize(size, size, { fit: "cover", position: "center" })
    .png()
    .toFile(out);
  console.log(`Wrote ${file} (${size}x${size})`);
}

console.log("Brand icons generated from realistic leaf photo.");
