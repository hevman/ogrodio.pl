import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { loadEbook } from "@/lib/ebooks/load";

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

type RouteContext = {
  params: Promise<{
    slug: string;
    assetPath: string[];
  }>;
};

function serveFile(filePath: string): Response | null {
  if (!fs.existsSync(filePath)) return null;
  const body = fs.readFileSync(filePath);
  const contentType = mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
  return new Response(body, {
    headers: { "Cache-Control": "max-age=86400", "Content-Type": contentType },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug, assetPath } = await context.params;
  const filename = assetPath.join("/");

  // 1. Primary: ebooks/<slug>/images/<filename>
  const imagesRoot = path.resolve(process.cwd(), "ebooks", slug, "images");
  const primaryPath = path.resolve(imagesRoot, filename);
  if (primaryPath.startsWith(imagesRoot)) {
    const res = serveFile(primaryPath);
    if (res) return res;
  }

  // 2. Fallback: externalImageDirs from ebook.json
  try {
    const manifest = loadEbook(slug).manifest;
    for (const dir of manifest.externalImageDirs ?? []) {
      const extRoot = path.resolve(dir);
      const extPath = path.resolve(extRoot, filename);
      // Security: must stay within declared dir
      if (!extPath.startsWith(extRoot)) continue;
      const res = serveFile(extPath);
      if (res) return res;
    }
  } catch {
    // ebook may not exist — fall through to 404
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
