import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

const root = process.cwd();
const ebooksRoot = path.join(root, "ebooks");
const exportsRoot = path.join(root, "exports");

const args = process.argv.slice(2);
const format = valueAfter("--format") ?? "all";
const requestedSlug = args.find((arg) => !arg.startsWith("--") && !["html", "pdf", "epub", "all"].includes(arg));

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSlugs() {
  return fs
    .readdirSync(ebooksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(ebooksRoot, slug, "ebook.json")));
}

function loadEbook(slug) {
  const ebookDir = path.join(ebooksRoot, slug);
  const manifest = readJson(path.join(ebookDir, "ebook.json"));
  const chapters = manifest.chapters.map((chapterId) => ({
    id: chapterId,
    ...readJson(path.join(ebookDir, "chapters", `${chapterId}.json`)),
  }));

  return { manifest, chapters, ebookDir };
}

function localImageUrl(slug, image) {
  const imagesDir = path.resolve(ebooksRoot, slug, "images");
  const imagePath = path.resolve(imagesDir, image);

  if (!imagePath.startsWith(imagesDir)) {
    throw new Error(`Image path must stay inside ebook images folder: ${image}`);
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Missing ebook image: ebooks/${slug}/images/${image}`);
  }

  return pathToFileURL(imagePath).href;
}

function renderImage(section, slug) {
  if (!section.image) return "";

  return `<figure>
  <img src="${localImageUrl(slug, section.image)}" alt="${escapeHtml(section.imageCaption ?? "")}">
  ${section.imageCaption ? `<figcaption>${escapeHtml(section.imageCaption)}</figcaption>` : ""}
</figure>`;
}

function renderTable(table) {
  if (!table) return "";

  return `<figure class="table-wrap">
  ${table.caption ? `<figcaption>${escapeHtml(table.caption)}</figcaption>` : ""}
  <table>
    <thead>
      <tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("\n")}
    </tbody>
  </table>
</figure>`;
}

function renderSection(section, slug) {
  const paragraphs = (section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");
  const bullets = section.bullets?.length
    ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
    : "";
  const checklist = section.checklist?.length
    ? `<ul class="checklist">${section.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  const note = section.note ? `<aside class="note">${escapeHtml(section.note)}</aside>` : "";
  const premiumBox = section.premiumBox
    ? `<aside class="premium-box"><strong>${escapeHtml(section.premiumBox.title)}</strong><span>${escapeHtml(section.premiumBox.body)}</span></aside>`
    : "";

  return `<section>
  ${section.heading ? `<h3>${escapeHtml(section.heading)}</h3>` : ""}
  ${renderImage(section, slug)}
  ${paragraphs}
  ${bullets}
  ${checklist}
  ${renderTable(section.table)}
  ${note}
  ${premiumBox}
</section>`;
}

function renderToc(chapters) {
  return `<section class="toc">
  <h2>Spis treści</h2>
  <ol>
    ${chapters.map((chapter, index) => `<li class="toc-item">
      <span>Rozdział ${index + 1}</span>
      <strong>${escapeHtml(chapter.title)}</strong>
      ${chapter.summary ? `<em>${escapeHtml(chapter.summary)}</em>` : ""}
    </li>`).join("\n")}
  </ol>
</section>`;
}

function renderHtml(ebook) {
  const { manifest, chapters } = ebook;
  const coverImage = manifest.cover
    ? `<img class="cover-bg" src="${localImageUrl(manifest.slug, manifest.cover)}" alt="">`
    : `<div class="cover-bg cover-bg-placeholder"></div>`;
  const publisherLogo = manifest.publisherLogo
    ? `<img class="cover-logo" src="${localImageUrl(manifest.slug, manifest.publisherLogo)}" alt="">`
    : "";
  const chapterHtml = chapters
    .map((chapter, index) => `<section class="chapter">
  <p class="eyebrow">Rozdział ${index + 1}</p>
  <h2>${escapeHtml(chapter.title)}</h2>
  ${chapter.summary ? `<p class="summary">${escapeHtml(chapter.summary)}</p>` : ""}
  ${(chapter.sections ?? []).map((section) => renderSection(section, manifest.slug)).join("\n")}
</section>`)
    .join("\n");

  return `<!doctype html>
<html lang="${escapeHtml(manifest.language ?? "pl")}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(manifest.title)}</title>
  <style>
    @page { margin: 16mm; size: A4; }
    body { color: #1e1b16; font-family: Arial, Helvetica, sans-serif; line-height: 1.62; margin: 0; }
    .cover { background: #10251b; break-after: page; color: #fff; display: grid; min-height: 248mm; overflow: hidden; position: relative; }
    .cover::after { background: linear-gradient(180deg, rgba(8, 22, 16, .22), rgba(8, 22, 16, .64) 48%, rgba(8, 22, 16, .9)); content: ""; inset: 0; position: absolute; z-index: 1; }
    .cover-bg { height: 100%; inset: 0; max-height: none; object-fit: cover; position: absolute; width: 100%; z-index: 0; }
    .cover-bg-placeholder { background: linear-gradient(135deg, #10251b, #2f6b4f); }
    .cover-content { align-self: end; display: grid; gap: 10px; padding: 0 20mm 28mm; position: relative; z-index: 2; }
    .cover-eyebrow { color: #dbe9de; font-size: 13px; font-weight: 800; letter-spacing: .13em; margin: 0; text-transform: uppercase; }
    .cover h1 { color: #fff; font-size: 50px; line-height: 1.03; margin: 0; max-width: 130mm; }
    .cover-subtitle { color: #f4f0e8; font-size: 20px; line-height: 1.35; margin: 2px 0 0; max-width: 126mm; }
    .cover-author { color: #dbe9de; font-size: 15px; font-weight: 700; margin: 8px 0 0; }
    .cover-publisher-bar { align-items: center; background: rgba(255, 255, 255, .94); bottom: 0; color: #173a2a; display: flex; font-size: 17px; font-weight: 800; gap: 8px; left: 0; min-height: 18mm; padding: 0 20mm; position: absolute; right: 0; z-index: 3; }
    .cover-logo { height: 32px; max-height: 32px; object-fit: contain; width: 32px; }
    .toc { break-after: page; }
    .toc h2 { border-bottom: 2px solid #ded5c7; font-size: 34px; margin: 0 0 24px; padding-bottom: 12px; }
    .toc ol { list-style: none; margin: 0; padding: 0; }
    .toc-item { border-bottom: 1px dotted #ded5c7; break-inside: avoid; display: grid; gap: 4px; padding: 0 0 14px; margin: 0 0 14px; }
    .toc-item span { color: #2f6b4f; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
    .toc-item strong { font-size: 17px; }
    .toc-item em { color: #665f55; font-size: 13px; font-style: normal; }
    .chapter { break-before: page; }
    .chapter section { break-inside: auto; margin-bottom: 18px; }
    .eyebrow { color: #2f6b4f; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    h2 { font-size: 34px; line-height: 1.15; margin: 0 0 8px; }
    h3 { break-after: avoid-page; font-size: 22px; margin: 28px 0 8px; page-break-after: avoid; }
    p, li { font-size: 16px; }
    figure { break-inside: avoid; margin: 14px 0; }
    img { display: block; height: auto; max-height: 92mm; max-width: 100%; object-fit: cover; width: 100%; }
    figcaption { color: #665f55; font-size: 12px; line-height: 1.45; margin-top: 5px; }
    .checklist { list-style: none; margin: 12px 0 14px; padding: 0; }
    .checklist li { border-bottom: 1px solid #ded5c7; font-size: 14px; line-height: 1.55; padding: 0 0 8px 22px; position: relative; }
    .checklist li::before { border: 1.5px solid #2f6b4f; border-radius: 3px; content: ""; height: 12px; left: 0; position: absolute; top: 4px; width: 12px; }
    .table-wrap { break-inside: avoid-page; margin: 14px 0 16px; page-break-inside: avoid; }
    table { border-collapse: collapse; font-size: 12.5px; line-height: 1.45; width: 100%; }
    th { background: #edf5ef; color: #2f6b4f; font-weight: 800; text-align: left; }
    th, td { border: 1px solid #ded5c7; padding: 7px 8px; vertical-align: top; }
    .summary { color: #665f55; }
    .note { background: #edf5ef; border-left: 4px solid #2f6b4f; break-inside: avoid-page; margin: 18px 0; page-break-inside: avoid; padding: 12px 14px; }
    .premium-box { background: #fff8e6; border: 1px solid #e7c86b; border-radius: 6px; break-inside: avoid-page; display: grid; gap: 4px; margin: 14px 0; page-break-inside: avoid; padding: 12px 14px; }
    .premium-box strong { color: #7a5600; font-size: 13px; }
    .premium-box span { font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <section class="cover">
    ${coverImage}
    <div class="cover-content">
      ${manifest.category ? `<p class="cover-eyebrow">${escapeHtml(manifest.category)}</p>` : ""}
      <h1>${escapeHtml(manifest.title)}</h1>
      ${manifest.subtitle ? `<p class="cover-subtitle">${escapeHtml(manifest.subtitle)}</p>` : ""}
      <p class="cover-author">${escapeHtml(manifest.author)}</p>
    </div>
    ${(manifest.publisher || manifest.publisherLogo) ? `<div class="cover-publisher-bar">${publisherLogo}<span>${escapeHtml(manifest.publisher ?? "")}</span></div>` : ""}
  </section>
  ${renderToc(chapters)}
  ${chapterHtml}
</body>
</html>`;
}

function writeHtml(ebook, outDir) {
  const html = renderHtml(ebook);
  const htmlPath = path.join(outDir, "book.html");
  fs.writeFileSync(htmlPath, html, "utf8");
  return htmlPath;
}

async function writePdf(htmlPath, outDir) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  const pdfPath = path.join(outDir, "book.pdf");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate: "<div style='font-size:9px;color:#777;width:100%;text-align:center'><span class='pageNumber'></span></div>",
    headerTemplate: "<div></div>",
    margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
  });
  await browser.close();
  return pdfPath;
}

async function writePdfPreview(pdfPath, outDir, requestedPageCount) {
  const source = await PDFDocument.load(fs.readFileSync(pdfPath));
  const preview = await PDFDocument.create();
  const pageCount = Math.min(Math.max(1, requestedPageCount), source.getPageCount());
  const pages = await preview.copyPages(source, Array.from({ length: pageCount }, (_, index) => index));
  pages.forEach((page) => preview.addPage(page));
  fs.writeFileSync(path.join(outDir, "preview.pdf"), await preview.save());
}

function epubXhtml(title, body, bodyClass = "") {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pl" xml:lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>${body}</body>
</html>`;
}

function imageMediaType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  const mediaTypes = {
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  const mediaType = mediaTypes[extension];
  if (!mediaType) throw new Error(`Unsupported EPUB image type: ${fileName}`);
  return mediaType;
}

function collectEpubImages(ebook) {
  const requestedImages = [
    ebook.manifest.epubCover ?? ebook.manifest.cover,
    ...ebook.chapters.flatMap((chapter) =>
      (chapter.sections ?? []).map((section) => section.image),
    ),
  ].filter(Boolean);

  return new Map(Array.from(new Set(requestedImages)).map((sourceName, index) => {
    const sourcePath = path.join(ebook.ebookDir, "images", sourceName);
    if (!fs.existsSync(sourcePath)) throw new Error(`Missing EPUB image: ${sourcePath}`);
    const extension = path.extname(sourceName).toLowerCase();
    return [sourceName, {
      id: `image-${index + 1}`,
      href: `images/image-${index + 1}${extension}`,
      mediaType: imageMediaType(sourceName),
      sourcePath,
    }];
  }));
}

function renderEpubSection(section, sectionIndex, imageAssets) {
  const sectionId = `section-${sectionIndex + 1}`;
  const paragraphs = (section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const bullets = section.bullets?.length
    ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
    : "";
  const checklist = section.checklist?.length
    ? `<ul class="checklist">${section.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  const table = renderTable(section.table);
  const note = section.note ? `<aside class="note">${escapeHtml(section.note)}</aside>` : "";
  const premiumBox = section.premiumBox
    ? `<aside class="premium-box"><strong>${escapeHtml(section.premiumBox.title)}</strong><span>${escapeHtml(section.premiumBox.body)}</span></aside>`
    : "";
  const imageAsset = section.image ? imageAssets.get(section.image) : null;
  const image = imageAsset
    ? `<figure><img src="${imageAsset.href}" alt="${escapeHtml(section.imageCaption ?? section.heading ?? "")}" />${section.imageCaption ? `<figcaption>${escapeHtml(section.imageCaption)}</figcaption>` : ""}</figure>`
    : "";

  return `<section id="${sectionId}">
    ${section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : ""}
    ${image}
    ${paragraphs}
    ${bullets}
    ${checklist}
    ${table}
    ${note}
    ${premiumBox}
  </section>`;
}

async function writeEpub(ebook, outDir) {
  const { manifest, chapters } = ebook;
  const imageAssets = collectEpubImages(ebook);
  const coverSource = manifest.epubCover ?? manifest.cover;
  const coverAsset = coverSource ? imageAssets.get(coverSource) : null;
  const zip = new JSZip();

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>`);

  const oebps = zip.folder("OEBPS");
  oebps.file("styles.css", `
body{color:#1e1b16;font-family:serif;font-size:1em;line-height:1.58;margin:5%;}
h1,h2,h3{color:#173a2a;line-height:1.2;page-break-after:avoid;}
h1{font-size:1.8em;margin:0 0 .7em;}h2{font-size:1.35em;margin:1.6em 0 .55em;}
p{margin:.7em 0;orphans:2;widows:2;}li{margin:.35em 0;}
img{display:block;height:auto;margin:0 auto;max-width:100%;}
figure{margin:1.2em 0;page-break-inside:avoid;}figcaption{color:#665f55;font-size:.82em;margin-top:.45em;text-align:center;}
table{border-collapse:collapse;font-size:.82em;margin:1em 0;width:100%;}
th,td{border:1px solid #cfc8bc;padding:.45em;text-align:left;vertical-align:top;}th{background:#edf5ef;color:#173a2a;}
.cover-page{margin:0;padding:0;text-align:center;}.cover-page img{height:auto;margin:0 auto;max-height:100vh;max-width:100%;}
.title-page{padding-top:18%;text-align:center;}.title-page .subtitle{color:#665f55;font-size:1.15em;}.title-page .publisher{font-weight:bold;margin-top:3em;}
.toc ol{padding-left:1.4em;}.toc li{margin:.6em 0;}.summary{color:#665f55;font-style:italic;}
.checklist{list-style-type:square;}.note{background:#edf5ef;border-left:4px solid #2f6b4f;margin:1.2em 0;padding:.8em 1em;}
.premium-box{background:#fff8e6;border:1px solid #e7c86b;margin:1.2em 0;padding:.8em 1em;}.premium-box strong,.premium-box span{display:block;}
`);

  for (const asset of imageAssets.values()) {
    oebps.file(asset.href, fs.readFileSync(asset.sourcePath));
  }

  const coverBody = coverAsset
    ? `<section epub:type="cover"><img src="${coverAsset.href}" alt="Okładka: ${escapeHtml(manifest.title)}" /></section>`
    : `<section epub:type="cover"><h1>${escapeHtml(manifest.title)}</h1></section>`;
  oebps.file("cover.xhtml", epubXhtml(manifest.title, coverBody, "cover-page"));
  oebps.file("title.xhtml", epubXhtml(manifest.title, `<section epub:type="titlepage" class="title-page">
    <h1>${escapeHtml(manifest.title)}</h1>
    ${manifest.subtitle ? `<p class="subtitle">${escapeHtml(manifest.subtitle)}</p>` : ""}
    <p>${escapeHtml(manifest.author)}</p>
    ${manifest.publisher ? `<p class="publisher">${escapeHtml(manifest.publisher)}</p>` : ""}
    ${manifest.year ? `<p>${escapeHtml(manifest.year)}</p>` : ""}
  </section>`));

  chapters.forEach((chapter, index) => {
    const body = `<section epub:type="chapter">
<h1>Rozdział ${index + 1}. ${escapeHtml(chapter.title)}</h1>
${chapter.summary ? `<p>${escapeHtml(chapter.summary)}</p>` : ""}
${(chapter.sections ?? []).map((section, sectionIndex) => renderEpubSection(section, sectionIndex, imageAssets)).join("")}
</section>`;
    oebps.file(`chapter-${index + 1}.xhtml`, epubXhtml(chapter.title, body));
  });

  const navItems = chapters.map((chapter, chapterIndex) => {
    const sections = (chapter.sections ?? []).map((section, sectionIndex) =>
      section.heading ? `<li><a href="chapter-${chapterIndex + 1}.xhtml#section-${sectionIndex + 1}">${escapeHtml(section.heading)}</a></li>` : "",
    ).join("");
    return `<li><a href="chapter-${chapterIndex + 1}.xhtml">${escapeHtml(chapter.title)}</a>${sections ? `<ol>${sections}</ol>` : ""}</li>`;
  }).join("");
  oebps.file("nav.xhtml", epubXhtml("Spis treści", `<nav epub:type="toc" class="toc" id="toc">
    <h1>Spis treści</h1><ol><li><a href="cover.xhtml">Okładka</a></li><li><a href="title.xhtml">Strona tytułowa</a></li>${navItems}</ol>
  </nav><nav epub:type="landmarks" hidden="hidden"><h2>Punkty orientacyjne</h2><ol>
    <li><a epub:type="cover" href="cover.xhtml">Okładka</a></li><li><a epub:type="toc" href="nav.xhtml">Spis treści</a></li><li><a epub:type="bodymatter" href="chapter-1.xhtml">Treść</a></li>
  </ol></nav>`));

  const ncxPoints = chapters.map((chapter, index) => `<navPoint id="chapter-${index + 1}" playOrder="${index + 2}"><navLabel><text>${escapeHtml(chapter.title)}</text></navLabel><content src="chapter-${index + 1}.xhtml" /></navPoint>`).join("\n    ");
  oebps.file("toc.ncx", `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:ogrodio:${escapeHtml(manifest.slug)}" /></head><docTitle><text>${escapeHtml(manifest.title)}</text></docTitle><navMap><navPoint id="cover" playOrder="1"><navLabel><text>Okładka</text></navLabel><content src="cover.xhtml" /></navPoint>${ncxPoints}</navMap></ncx>`);

  const imageManifestItems = Array.from(imageAssets.entries()).map(([sourceName, asset]) =>
    `<item id="${asset.id}" href="${asset.href}" media-type="${asset.mediaType}"${sourceName === coverSource ? ' properties="cover-image"' : ""} />`,
  );
  const manifestItems = [
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />',
    '<item id="css" href="styles.css" media-type="text/css" />',
    '<item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml" />',
    '<item id="title-page" href="title.xhtml" media-type="application/xhtml+xml" />',
    ...chapters.map((_, index) => `<item id="chapter-${index + 1}" href="chapter-${index + 1}.xhtml" media-type="application/xhtml+xml" />`),
    ...imageManifestItems,
  ].join("\n    ");
  const spineItems = ['<itemref idref="cover-page" />', '<itemref idref="title-page" />', '<itemref idref="nav" />', ...chapters.map((_, index) => `<itemref idref="chapter-${index + 1}" />`)].join("\n    ");
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  oebps.file("package.opf", `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${escapeHtml(manifest.language ?? "pl")}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:ogrodio:${escapeHtml(manifest.slug)}</dc:identifier>
    <dc:title>${escapeHtml(manifest.title)}</dc:title>
    <dc:language>${escapeHtml(manifest.language ?? "pl")}</dc:language>
    <dc:creator>${escapeHtml(manifest.author)}</dc:creator>
    <dc:publisher>${escapeHtml(manifest.publisher ?? "Ogrodio")}</dc:publisher>
    <dc:description>${escapeHtml(manifest.description ?? "")}</dc:description>
    <dc:rights>© ${escapeHtml(manifest.year ?? String(new Date().getFullYear()))} Ogrodio. Wszelkie prawa zastrzeżone.</dc:rights>
    <meta property="dcterms:modified">${modified}</meta>
    <meta property="schema:accessMode">textual</meta><meta property="schema:accessMode">visual</meta>
    <meta property="schema:accessibilityFeature">tableOfContents</meta><meta property="schema:accessibilityFeature">alternativeText</meta>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`);

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 }, mimeType: "application/epub+zip" });
  fs.writeFileSync(path.join(outDir, "book.epub"), buffer);
}

async function buildOne(slug) {
  const ebook = loadEbook(slug);
  const outDir = path.join(exportsRoot, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const htmlPath = writeHtml(ebook, outDir);
  if (format === "pdf" || format === "all") {
    const pdfPath = await writePdf(htmlPath, outDir);
    if (ebook.manifest.previewPages) {
      await writePdfPreview(pdfPath, outDir, ebook.manifest.previewPages);
    }
  }
  if (format === "epub" || format === "all") await writeEpub(ebook, outDir);

  console.log(`Built ${slug} -> ${path.relative(root, outDir)}`);
}

const slugs = requestedSlug ? [requestedSlug] : getSlugs();

if (!slugs.length) {
  throw new Error("No ebooks found.");
}

for (const slug of slugs) {
  await buildOne(slug);
}
