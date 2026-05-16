import { NextResponse } from "next/server";

import { getPageData } from "@/lib/book-data";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  try {
    return NextResponse.json(getPageData(Number(resolvedParams.page)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
