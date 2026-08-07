import { NextResponse } from "next/server";

import { getManifest } from "@/lib/book-data";

export function GET() {
  return NextResponse.json(getManifest());
}
