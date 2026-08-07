import ReaderShell from "@/components/reader-shell";
import { getManifest, getPageData } from "@/lib/book-data";

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const manifest = getManifest();
  const requestedPage = Number(resolvedSearchParams?.page) || manifest.pages[0]?.page;
  const currentPage =
    manifest.pages.find((entry) => entry.page === requestedPage)?.page ??
    manifest.pages[0]?.page;
  const pageData = getPageData(currentPage);

  return (
    <ReaderShell
      manifest={manifest}
      initialPage={pageData}
      initialPageNumber={currentPage}
      queryPageNumber={resolvedSearchParams?.page ? currentPage : null}
    />
  );
}
