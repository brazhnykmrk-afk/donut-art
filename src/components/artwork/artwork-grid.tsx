import { ImageOff } from "lucide-react";

import { ArtworkCard } from "@/components/artwork/artwork-card";
import { EmptyState } from "@/components/empty-state";
import { StaggerGrid, StaggerItem } from "@/components/motion";
import type { ArtworkCardData } from "@/types";

export function ArtworkGrid({
  artworks,
  showStatus = false,
  emptyTitle = "No artwork found",
  emptyDescription = "Try a different search, or check back later.",
}: {
  artworks: ArtworkCardData[];
  showStatus?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (artworks.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <StaggerGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {artworks.map((artwork) => (
        <StaggerItem key={artwork.id}>
          <ArtworkCard artwork={artwork} showStatus={showStatus} />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
