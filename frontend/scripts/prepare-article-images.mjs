import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const frontendRoot = process.cwd();
const imageDir = path.join(frontendRoot, "public", "images", "articles");
const articlesDir = path.resolve(frontendRoot, "..", "backend", "content", "articles");
const sourceExtensions = new Set([".jpg", ".jpeg", ".png"]);
const articleImageUrlPrefix = "/images/articles/";

function toWebpUrl(value) {
  if (typeof value !== "string" || !value.startsWith(articleImageUrlPrefix)) {
    return value;
  }

  const extension = path.extname(value).toLowerCase();
  if (!sourceExtensions.has(extension)) {
    return value;
  }

  return value.slice(0, -extension.length) + ".webp";
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function shouldConvert(sourcePath, targetPath) {
  if (!(await exists(targetPath))) {
    return true;
  }

  const [sourceStat, targetStat] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath),
  ]);

  return sourceStat.mtimeMs > targetStat.mtimeMs;
}

async function convertImages() {
  await fs.mkdir(imageDir, { recursive: true });
  const entries = await fs.readdir(imageDir, { withFileTypes: true });
  let converted = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (!sourceExtensions.has(extension)) continue;

    const sourcePath = path.join(imageDir, entry.name);
    const targetName = entry.name.slice(0, -extension.length) + ".webp";
    const targetPath = path.join(imageDir, targetName);

    if (!(await shouldConvert(sourcePath, targetPath))) {
      skipped++;
      continue;
    }

    await sharp(sourcePath)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(targetPath);

    converted++;
  }

  return { converted, skipped };
}

async function updateArticleJson() {
  const files = (await fs.readdir(articlesDir)).filter((file) => file.endsWith(".json"));
  let updated = 0;

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const original = await fs.readFile(filePath, "utf8");
    const article = JSON.parse(original);

    const nextCoverImage = toWebpUrl(article.cover_image);
    const inlineImage = article.inline_image ?? article.inlineImage;
    const nextInlineImage = inlineImage && typeof inlineImage === "object"
      ? { ...inlineImage, src: toWebpUrl(inlineImage.src) }
      : inlineImage;

    let changed = false;
    if (nextCoverImage !== article.cover_image) {
      article.cover_image = nextCoverImage;
      changed = true;
    }

    if (article.inline_image && JSON.stringify(nextInlineImage) !== JSON.stringify(article.inline_image)) {
      article.inline_image = nextInlineImage;
      changed = true;
    }

    if (article.inlineImage && JSON.stringify(nextInlineImage) !== JSON.stringify(article.inlineImage)) {
      article.inlineImage = nextInlineImage;
      changed = true;
    }

    if (!changed) continue;

    await fs.writeFile(filePath, `${JSON.stringify(article, null, 2)}\n`, "utf8");
    updated++;
  }

  return updated;
}

const imageResult = await convertImages();
const updatedJson = await updateArticleJson();

console.log(
  `Article images ready. Converted: ${imageResult.converted}, skipped: ${imageResult.skipped}, JSON updated: ${updatedJson}.`,
);
