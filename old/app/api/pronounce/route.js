import { NextResponse } from "next/server";

import { getPhrasePronunciation } from "@/lib/pronunciation";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "Missing word" }, { status: 400 });
  }

  return NextResponse.json(getPhrasePronunciation(word));
}
