import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dataRoot = join(process.cwd(), "data");
const manifestPath = join(dataRoot, "manifest.json");

export function getManifest() {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

export function getPageData(pageNumber) {
  const filePath = join(dataRoot, "pages", `page-${String(pageNumber).padStart(3, "0")}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Page ${pageNumber} not found`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}
