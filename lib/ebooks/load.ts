import fs from "node:fs";
import path from "node:path";
import type { Ebook, EbookChapter, EbookManifest } from "./schema";

const ebooksRoot = path.join(process.cwd(), "ebooks");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function getEbookSlugs() {
  if (!fs.existsSync(ebooksRoot)) return [];

  return fs
    .readdirSync(ebooksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(ebooksRoot, slug, "ebook.json")))
    .sort();
}

export function loadEbook(slug: string): Ebook {
  const ebookDir = path.join(ebooksRoot, slug);
  const manifest = readJson<EbookManifest>(path.join(ebookDir, "ebook.json"));
  const chapters = manifest.chapters.map((chapterId) => {
    const chapter = readJson<Omit<EbookChapter, "id"> & { id?: string }>(
      path.join(ebookDir, "chapters", `${chapterId}.json`),
    );

    return {
      id: chapter.id ?? chapterId,
      ...chapter,
    };
  });

  return { manifest, chapters };
}

export function loadAllEbooks() {
  return getEbookSlugs().map(loadEbook);
}
