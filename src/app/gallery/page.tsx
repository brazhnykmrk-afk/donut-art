import type { Metadata } from "next";
import { Suspense } from "react";

import { ArtworkGrid } from "@/components/artwork/artwork-grid";
import { Pagination } from "@/components/pagination";
import { SearchBar } from "@/components/search-bar";
import { gallerySearchSchema } from "@/lib/validation/artwork";
import { listGallery } from "@/services/artwork-service";

export const metadata: Metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const params = gallerySearchSchema.parse(searchParams);
  const gallery = await listGallery({ query: params.q, page: params.page });

  return (
    <div className="container py-12">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Map Art <span className="text-gradient">Gallery</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            {gallery.total} piece{gallery.total === 1 ? "" : "s"} from the Donut
            SMP community
          </p>
        </div>
        <Suspense>
          <SearchBar placeholder="Search by title or creator…" />
        </Suspense>
      </div>

      <ArtworkGrid
        artworks={gallery.items}
        emptyTitle={params.q ? "Nothing matches your search" : "No artwork yet"}
        emptyDescription={
          params.q
            ? `No artwork or creator matches “${params.q}”.`
            : "Be the first to upload your Map Art!"
        }
      />

      <Pagination
        page={gallery.page}
        pageCount={gallery.pageCount}
        basePath="/gallery"
        query={params.q}
      />
    </div>
  );
}
