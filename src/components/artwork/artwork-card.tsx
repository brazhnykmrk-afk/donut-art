import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ArtworkCardData } from "@/types";

/**
 * Gallery tile: square preview, title and creator. `showStatus` adds a
 * draft/published badge for the owner's dashboard.
 */
export function ArtworkCard({
  artwork,
  showStatus = false,
}: {
  artwork: ArtworkCardData;
  showStatus?: boolean;
}) {
  return (
    <Link
      href={`/artwork/${artwork.id}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card surface-glow transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showStatus && (
          <div className="absolute right-2 top-2">
            <Badge variant={artwork.published ? "success" : "muted"}>
              {artwork.published ? "Published" : "Draft"}
            </Badge>
          </div>
        )}
        {artwork.price && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-background/80 backdrop-blur">{artwork.price}</Badge>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-semibold group-hover:text-primary">
            {artwork.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            by {artwork.authorNickname}
          </p>
        </div>
        <Avatar className="h-8 w-8 shrink-0">
          {artwork.authorAvatarUrl && (
            <AvatarImage src={artwork.authorAvatarUrl} alt={artwork.authorNickname} />
          )}
          <AvatarFallback className="text-xs">
            {artwork.authorNickname.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
}
