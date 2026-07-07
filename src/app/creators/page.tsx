import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";

import { CreatorCard } from "@/components/creators/creator-card";
import { EmptyState } from "@/components/empty-state";
import { StaggerGrid, StaggerItem } from "@/components/motion";
import { SearchBar } from "@/components/search-bar";
import { listCreators } from "@/services/creator-service";

export const metadata: Metadata = { title: "Creators" };
export const dynamic = "force-dynamic";

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const creators = await listCreators(query);

  return (
    <div className="container py-12">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Meet the <span className="text-gradient">Creators</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            The artists behind Donut SMP&apos;s Map Art
          </p>
        </div>
        <Suspense>
          <SearchBar placeholder="Search by nickname…" />
        </Suspense>
      </div>

      {creators.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No creators match your search" : "No creators yet"}
          description={
            query
              ? `Nobody with a nickname like “${query}” has joined yet.`
              : "The community is just getting started — create an account to be the first!"
          }
        />
      ) : (
        <StaggerGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <StaggerItem key={creator.userId} className="h-full">
              <CreatorCard creator={creator} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
