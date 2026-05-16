import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const booksDir = join(process.cwd(), "books");
const dataDir = join(process.cwd(), "data");
const pagesDir = join(dataDir, "pages");
const overridesDir = join(dataDir, "overrides", "pages");

mkdirSync(pagesDir, { recursive: true });

function pageNumber(filename) {
  return Number(filename.match(/\d+/)?.[0] || 0);
}

const targetPages = new Set([
  14, 17, 22, 24, 25, 28, 29,
  ...Array.from({ length: 71 }, (_, i) => i + 30)
]);

const pageFiles = readdirSync(booksDir)
  .filter((name) => /^page \d+\.png$/i.test(name))
  .filter((name) => targetPages.has(pageNumber(name)))
  .sort((a, b) => pageNumber(a) - pageNumber(b));

console.log(`Re-OCR-ing ${pageFiles.length} pages...`);

for (const filename of pageFiles) {
  const page = pageNumber(filename);
  const imagePath = join(booksDir, filename);
  const dimensions = readPngDimensions(imagePath);
  
  console.log(`Processing page ${page}...`);
  const regions = buildRegionsFromTsv(runTesseractPasses(imagePath), dimensions);
  const layout = guessLayout(regions);
  
  let payload = {
    page,
    image: `/books/${filename}`,
    imageApiPath: `/api/books/${encodeURIComponent(filename)}`,
    layout,
    stats: {
      regionCount: regions.length,
      wordCount: regions.reduce((count, region) => count + region.words.length, 0),
      imageWidth: dimensions.width,
      imageHeight: dimensions.height,
    },
    panels: buildPanels(layout, regions),
    regions,
  };

  payload = applyPageOverride(payload);
  
  const outputPath = join(pagesDir, `page-${String(page).padStart(3, "0")}.json`);
  writeFileSync(outputPath, JSON.stringify(payload, null, 2));
}

console.log("Done!");

// --- Helper functions copied from generate-page-data.mjs ---

function runTesseractPasses(imagePath) {
  return [11, 6].map((psm) => ({
    psm,
    tsv: execFileSync(
      "tesseract",
      [imagePath, "stdout", "--psm", String(psm), "tsv"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ),
  }));
}

function buildRegionsFromTsv(passes, dimensions) {
  const regions = [];
  for (const pass of passes) {
    const rows = pass.tsv.trim().split("\n").slice(1).map(l => l.split("\t")).filter(c => c.length >= 12).map(c => ({
      level: Number(c[0]), blockNum: Number(c[2]), parNum: Number(c[3]), lineNum: Number(c[4]), wordNum: Number(c[5]),
      left: Number(c[6]), top: Number(c[7]), width: Number(c[8]), height: Number(c[9]), conf: Number(c[10]), text: (c[11] || "").trim()
    }));
    const lineBuckets = new Map();
    for (const row of rows) {
      if (row.level !== 5 || !row.text || row.conf < 35) continue;
      const key = `${row.blockNum}-${row.parNum}-${row.lineNum}`;
      if (!lineBuckets.has(key)) lineBuckets.set(key, []);
      lineBuckets.get(key).push(row);
    }
    for (const words of lineBuckets.values()) {
      words.sort((a, b) => a.left - b.left);
      const text = words.map(w => w.text).join(" ").trim();
      const left = Math.min(...words.map(w => w.left));
      const top = Math.min(...words.map(w => w.top));
      const right = Math.max(...words.map(w => w.left + w.width));
      const bottom = Math.max(...words.map(w => w.top + w.height));
      regions.push({
        id: `r${regions.length + 1}`, text,
        x: round(left / dimensions.width), y: round(top / dimensions.height),
        w: round((right - left) / dimensions.width), h: round((bottom - top) / dimensions.height),
        words: words.map(w => w.text)
      });
    }
  }
  return regions;
}

function guessLayout(regions) {
  let q = 0;
  const counts = { tl: 0, tr: 0, bl: 0, br: 0 };
  for (const r of regions) {
    if (r.x < 0.5 && r.y < 0.5) counts.tl++;
    else if (r.x >= 0.5 && r.y < 0.5) counts.tr++;
    else if (r.x < 0.5 && r.y >= 0.5) counts.bl++;
    else counts.br++;
  }
  return Object.values(counts).filter(c => c >= 2).length >= 4 ? "quad" : "single";
}

function buildPanels(layout, regions) {
  if (layout === "single") return [{ id: "full-page", label: "Full Page", x: 0, y: 0, w: 1, h: 1, regionIds: regions.map(r => r.id) }];
  const panels = [
    { id: "top-left", label: "Top Left", x: 0, y: 0, w: 0.5, h: 0.5, regionIds: [] },
    { id: "top-right", label: "Top Right", x: 0.5, y: 0, w: 0.5, h: 0.5, regionIds: [] },
    { id: "bottom-left", label: "Bottom Left", x: 0, y: 0.5, w: 0.5, h: 0.5, regionIds: [] },
    { id: "bottom-right", label: "Bottom Right", x: 0.5, y: 0.5, w: 0.5, h: 0.5, regionIds: [] },
  ];
  for (const r of regions) {
    const p = (r.x < 0.5 && r.y < 0.5) ? panels[0] : (r.x >= 0.5 && r.y < 0.5) ? panels[1] : (r.x < 0.5 && r.y >= 0.5) ? panels[2] : panels[3];
    p.regionIds.push(r.id);
  }
  return panels.filter(p => p.regionIds.length > 0);
}

function round(v) { return Number(v.toFixed(4)); }

function readPngDimensions(filePath) {
  const buffer = readFileSync(filePath);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function applyPageOverride(payload) {
  const filePath = join(overridesDir, `page-${String(payload.page).padStart(3, "0")}.json`);
  if (!existsSync(filePath)) return payload;
  const override = JSON.parse(readFileSync(filePath, "utf8"));
  const next = { ...payload, ...override };
  if (override.regions) {
    next.regions = override.regions.map((r, i) => ({ ...r, id: r.id || `r${i+1}`, order: i, words: r.words || r.text.split(/\s+/).filter(Boolean) }));
  }
  return next;
}
