import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const booksRoot = join(process.cwd(), "books");

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const filePath = join(booksRoot, ...slug);

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const file = readFileSync(filePath);
  return new Response(file, {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(file.byteLength),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
