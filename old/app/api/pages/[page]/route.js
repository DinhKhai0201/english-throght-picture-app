import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

import { getPageData } from "@/lib/book-data";

const dataRoot = join(process.cwd(), "data");

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

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  try {
    return NextResponse.json(getPageData(Number(resolvedParams.page)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const pageNumber = Number(resolvedParams.page);
  const filePath = join(dataRoot, "pages", `page-${String(pageNumber).padStart(3, "0")}.json`);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: `Page ${pageNumber} not found` }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { regions } = body;

    if (!Array.isArray(regions)) {
      return NextResponse.json({ error: "Invalid regions data format" }, { status: 400 });
    }

    const payload = JSON.parse(readFileSync(filePath, "utf8"));

    const nextRegions = regions.map((region, index) => ({
      ...region,
      id: `r${index + 1}`,
      order: index,
      words: region.words || region.text.split(/\s+/).filter(Boolean),
    }));

    const next = {
      ...payload,
      regions: nextRegions,
      stats: {
        ...payload.stats,
        regionCount: nextRegions.length,
        wordCount: nextRegions.reduce((count, r) => count + r.words.length, 0),
      },
      panels: buildPanels(payload.layout || "quad", nextRegions),
    };

    writeFileSync(filePath, JSON.stringify(next, null, 2));

    return NextResponse.json({ success: true, page: next });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
