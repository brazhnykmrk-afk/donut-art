import Link from "next/link";
import { Images } from "lucide-react";

import { StarRating } from "@/components/reviews/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMonthYear } from "@/lib/utils";
import type { CreatorCardData } from "@/types";

export function CreatorCard({ creator }: { creator: CreatorCardData }) {
  return (
    <Link
      href={`/creators/${encodeURIComponent(creator.nickname)}`}
      className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-6 surface-glow transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border-primary/30">
          {creator.avatarUrl && (
            <AvatarImage src={creator.avatarUrl} alt={creator.nickname} />
          )}
          <AvatarFallback className="text-lg">
            {creator.nickname.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold group-hover:text-primary">
            {creator.nickname}
          </h3>
          <p className="text-xs text-muted-foreground">
            Joined {formatMonthYear(creator.joinedAt)}
          </p>
        </div>
      </div>

      {creator.bio && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {creator.bio}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <StarRating rating={creator.averageRating} count={creator.reviewCount} />
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Images className="h-4 w-4" />
          {creator.artworkCount}
        </span>
      </div>
    </Link>
  );
}
