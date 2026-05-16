import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const booksDir = join(process.cwd(), "books");
const dataDir = join(process.cwd(), "data");
const pagesDir = join(dataDir, "pages");
const overridesDir = join(dataDir, "overrides", "pages");

mkdirSync(pagesDir, { recursive: true });

const pageFiles = readdirSync(booksDir)
  .filter((name) => /^page \d+\.png$/i.test(name))
  .sort((a, b) => pageNumber(a) - pageNumber(b));

const manifest = { generatedAt: new Date().toISOString(), totalPages: pageFiles.length, pages: [] };

for (const filename of pageFiles) {
  const page = pageNumber(filename);
  const imagePath = `/books/${filename}`;
  const dimensions = readPngDimensions(join(booksDir, filename));
  const regions = buildRegionsFromTsv(runTesseractPasses(join(booksDir, filename)), dimensions);
  const layout = guessLayout(regions);
  let payload = {
    page,
    image: imagePath,
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
  payload.stats = {
    regionCount: payload.regions.length,
    wordCount: payload.regions.reduce((count, region) => count + region.words.length, 0),
    imageWidth: dimensions.width,
    imageHeight: dimensions.height,
  };
  if (!payload.panels?.length) {
    payload.panels = buildPanels(payload.layout, payload.regions);
  }

  const outputPath = join(pagesDir, `page-${String(page).padStart(3, "0")}.json`);
  writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  manifest.pages.push({
    page,
    layout,
    regionCount: regions.length,
    dataPath: `/data/pages/${basename(outputPath)}`,
    image: imagePath,
  });
}

writeFileSync(join(dataDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Generated ${manifest.pages.length} page files.`);

function pageNumber(filename) {
  return Number(filename.match(/\d+/)?.[0] || 0);
}

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
  const primaryPass = passes.find((pass) => pass.psm === 11) || passes[0];
  const secondaryPass = passes.find((pass) => pass.psm === 6);

  let primaryRegions = extractRegionsFromPass(primaryPass, dimensions);
  primaryRegions = dedupeRegions(mergeWrappedLines(sortRegions(primaryRegions)));

  if (!secondaryPass) {
    return primaryRegions;
  }

  const needsSupplement = primaryRegions.length < 4 || primaryRegions.reduce((sum, region) => sum + region.words.length, 0) < 18;
  if (!needsSupplement) {
    return primaryRegions;
  }

  const secondaryRegions = dedupeRegions(mergeWrappedLines(sortRegions(extractRegionsFromPass(secondaryPass, dimensions))));
  return dedupeRegions([...primaryRegions, ...secondaryRegions]);
}

function extractRegionsFromPass(pass, dimensions) {
  const rows = pass.tsv
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => line.split("\t"))
    .filter((cells) => cells.length >= 12)
    .map((cells) => ({
      level: Number(cells[0]),
      blockNum: Number(cells[2]),
      parNum: Number(cells[3]),
      lineNum: Number(cells[4]),
      wordNum: Number(cells[5]),
      left: Number(cells[6]),
      top: Number(cells[7]),
      width: Number(cells[8]),
      height: Number(cells[9]),
      conf: Number(cells[10]),
      text: (cells[11] || "").trim(),
    }));

  const lineBuckets = new Map();
  for (const row of rows) {
    if (row.level !== 5 || !row.text) continue;
    if (row.conf < 35) continue;
    if (!/[A-Za-z]/.test(row.text)) continue;
    if (isSuspiciousWordBox(row, dimensions)) continue;
    const key = `${row.blockNum}-${row.parNum}-${row.lineNum}`;
    if (!lineBuckets.has(key)) lineBuckets.set(key, []);
    lineBuckets.get(key).push(row);
  }

  const regions = [];
  for (const words of lineBuckets.values()) {
    words.sort((a, b) => a.left - b.left);
    const text = normalizeText(words.map((word) => word.text).join(" "));
    if (!text || text.length < 2) continue;
    const left = Math.min(...words.map((word) => word.left));
    const top = Math.min(...words.map((word) => word.top));
    const right = Math.max(...words.map((word) => word.left + word.width));
    const bottom = Math.max(...words.map((word) => word.top + word.height));
    const region = {
      id: `r${regions.length + 1}`,
      order: regions.length,
      text,
      x: round(left / dimensions.width),
      y: round(top / dimensions.height),
      w: round((right - left) / dimensions.width),
      h: round((bottom - top) / dimensions.height),
      words: words.map((word) => word.text),
      conf: round(words.reduce((sum, word) => sum + word.conf, 0) / words.length),
      source: `psm-${pass.psm}`,
    };

    if (region.w > 0.02 && region.h > 0.01 && !isSuspiciousRegion(region)) {
      regions.push(region);
    }
  }

  return regions;
}

function normalizeText(text) {
  return text
    .replace(/[|]/g, "I")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;?!:])/g, "$1")
    .trim();
}

function sortRegions(regions) {
  return regions
    .sort((a, b) => {
      const rowDiff = a.y - b.y;
      if (Math.abs(rowDiff) > 0.02) return rowDiff;
      return a.x - b.x;
    })
    .map((region, index) => ({ ...region, order: index, id: `r${index + 1}` }));
}

function mergeWrappedLines(regions) {
  const merged = [];
  const lastByQuadrant = new Map();

  for (const region of regions) {
    const quadrant = quadrantOf(region);
    const previous = lastByQuadrant.get(quadrant);
    if (previous && shouldMergeRegions(previous, region)) {
      const previousRight = previous.x + previous.w;
      const previousBottom = previous.y + previous.h;
      const nextRight = region.x + region.w;
      const nextBottom = region.y + region.h;
      const nextLeft = Math.min(previous.x, region.x);
      const nextTop = Math.min(previous.y, region.y);
      previous.text = normalizeText(`${previous.text} ${region.text}`);
      previous.x = round(nextLeft);
      previous.y = round(nextTop);
      previous.w = round(Math.max(previousRight, nextRight) - nextLeft);
      previous.h = round(Math.max(previousBottom, nextBottom) - nextTop);
      previous.words.push(...region.words);
      continue;
    }

    const nextRegion = { ...region, words: [...region.words] };
    merged.push(nextRegion);
    lastByQuadrant.set(quadrant, nextRegion);
  }

  return sortRegions(merged);
}

function shouldMergeRegions(previous, current) {
  if (quadrantOf(previous) !== quadrantOf(current)) return false;

  const previousBottom = previous.y + previous.h;
  const verticalGap = current.y - previousBottom;
  if (verticalGap < -0.002 || verticalGap > 0.04) return false;

  const leftAligned = Math.abs(previous.x - current.x) <= 0.08;
  const continuationIndent = current.x <= previous.x + 0.08;
  if (!leftAligned && !continuationIndent) return false;

  if (endsSentence(previous.text)) return false;

  return true;
}

function quadrantOf(region) {
  const centerX = region.x + region.w / 2;
  const centerY = region.y + region.h / 2;
  if (centerX < 0.5 && centerY < 0.5) return "top-left";
  if (centerX >= 0.5 && centerY < 0.5) return "top-right";
  if (centerX < 0.5 && centerY >= 0.5) return "bottom-left";
  return "bottom-right";
}

function endsSentence(text) {
  return /[.?!]["'”’)]?$/.test(text.trim());
}

function isSuspiciousWordBox(row, dimensions) {
  const widthRatio = row.width / dimensions.width;
  const heightRatio = row.height / dimensions.height;
  return heightRatio > 0.08 || (widthRatio > 0.3 && heightRatio > 0.05);
}

function isSuspiciousRegion(region) {
  const text = region.text.trim();
  if (region.words.length === 1 && region.conf < 85 && !/[.?!,:;"'”’)]$/.test(text) && !/^[A-Z]{1,5}$/.test(text)) {
    return true;
  }
  if (region.words.length <= 2 && /[0-9]/.test(text)) return true;

  const noiseWords = region.words.filter((word) => /^(?:[aeiou]{1,4}|[eo]{2,4}|[a-z]{1,2})$/i.test(word)).length;
  if (region.words.length >= 3 && noiseWords / region.words.length > 0.7 && region.conf < 88) {
    return true;
  }

  return false;
}

function dedupeRegions(regions) {
  const deduped = [];

  for (const region of sortRegions(regions)) {
    const existingIndex = deduped.findIndex((candidate) => isSameRegion(candidate, region));
    if (existingIndex === -1) {
      deduped.push(region);
      continue;
    }

    const currentScore = region.words.length * 10 + (region.conf || 0);
    const existingScore = deduped[existingIndex].words.length * 10 + (deduped[existingIndex].conf || 0);
    if (currentScore > existingScore) {
      deduped[existingIndex] = region;
    }
  }

  return sortRegions(deduped);
}

function isSameRegion(a, b) {
  const overlap = intersectionOverUnion(a, b);
  const sameText = normalizeComparableText(a.text) === normalizeComparableText(b.text);
  return overlap > 0.45 || (sameText && overlap > 0.18);
}

function intersectionOverUnion(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
  if (!intersection) return 0;
  const areaA = a.w * a.h;
  const areaB = b.w * b.h;
  return intersection / (areaA + areaB - intersection);
}

function normalizeComparableText(text) {
  return text.toLowerCase().replace(/[^a-z]+/g, " ").trim();
}

function applyPageOverride(payload) {
  const filePath = join(overridesDir, `page-${String(payload.page).padStart(3, "0")}.json`);
  if (!existsSync(filePath)) return payload;

  const override = JSON.parse(readFileSync(filePath, "utf8"));
  const next = {
    ...payload,
    ...override,
  };

  if (override.regions) {
    next.regions = override.regions.map((region, index) => ({
      ...region,
      id: region.id || `r${index + 1}`,
      order: index,
      words: region.words || region.text.split(/\s+/).filter(Boolean),
    }));
  }

  if (override.layout && !override.panels) {
    next.panels = buildPanels(override.layout, next.regions);
  }

  return next;
}

function guessLayout(regions) {
  const counts = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  };

  for (const region of regions) {
    const centerX = region.x + region.w / 2;
    const centerY = region.y + region.h / 2;
    if (centerX < 0.5 && centerY < 0.5) counts.topLeft += 1;
    else if (centerX >= 0.5 && centerY < 0.5) counts.topRight += 1;
    else if (centerX < 0.5 && centerY >= 0.5) counts.bottomLeft += 1;
    else counts.bottomRight += 1;
  }

  const quadrants = Object.values(counts).filter((count) => count >= 2).length;
  return quadrants >= 4 ? "quad" : "single";
}

function buildPanels(layout, regions) {
  if (layout === "single") {
    return [
      {
        id: "full-page",
        label: "Full Page",
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        regionIds: regions.map((region) => region.id),
      },
    ];
  }

  const panels = [
    { id: "top-left", label: "Top Left", x: 0, y: 0, w: 0.5, h: 0.5, regionIds: [] },
    { id: "top-right", label: "Top Right", x: 0.5, y: 0, w: 0.5, h: 0.5, regionIds: [] },
    { id: "bottom-left", label: "Bottom Left", x: 0, y: 0.5, w: 0.5, h: 0.5, regionIds: [] },
    { id: "bottom-right", label: "Bottom Right", x: 0.5, y: 0.5, w: 0.5, h: 0.5, regionIds: [] },
  ];

  for (const region of regions) {
    const centerX = region.x + region.w / 2;
    const centerY = region.y + region.h / 2;
    const panel =
      centerX < 0.5 && centerY < 0.5
        ? panels[0]
        : centerX >= 0.5 && centerY < 0.5
          ? panels[1]
          : centerX < 0.5 && centerY >= 0.5
            ? panels[2]
            : panels[3];
    panel.regionIds.push(region.id);
  }

  return panels.filter((panel) => panel.regionIds.length > 0);
}

function round(value) {
  return Number(value.toFixed(4));
}

function readPngDimensions(filePath) {
  const buffer = readFileSync(filePath);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`Unsupported PNG file: ${filePath}`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}
