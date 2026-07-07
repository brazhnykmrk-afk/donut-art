import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MessageCircle } from "lucide-react";

import { ArtworkGrid } from "@/components/artwork/artwork-grid";
import { FadeIn } from "@/components/motion";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { StarRating } from "@/components/reviews/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { formatMonthYear } from "@/lib/utils";
import { getCreatorByNickname } from "@/services/creator-service";
import { getViewerReview } from "@/services/review-service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { nickname: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: decodeURIComponent(params.nickname) };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const nickname = decodeURIComponent(params.nickname);
  const [creator, session] = await Promise.all([
    getCreatorByNickname(nickname),
    auth(),
  ]);
  if (!creator) notFound();

  const viewerId = session?.user?.id ?? null;
  const viewerReview =
    viewerId && viewerId !== creator.userId
      ? await getViewerReview(creator.userId, viewerId)
      : null;

  return (
    <div className="container space-y-14 py-12">
      {/* Profile header */}
      <FadeIn>
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 surface-glow md:flex-row md:items-center">
          <Avatar className="h-24 w-24 border-2 border-primary/40 shadow-glow-sm">
            {creator.avatarUrl && (
              <AvatarImage src={creator.avatarUrl} alt={creator.nickname} />
            )}
            <AvatarFallback className="text-2xl">
              {creator.nickname.slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold">{creator.nickname}</h1>
              <Badge variant="secondary">
                <CalendarDays className="h-3 w-3" />
                Joined {formatMonthYear(creator.joinedAt)}
              </Badge>
            </div>
            <StarRating
              rating={creator.averageRating}
              count={creator.reviewCount}
              size="lg"
            />
            {creator.bio && (
              <p className="max-w-2xl leading-relaxed text-muted-foreground">
                {creator.bio}
              </p>
            )}
          </div>

          {creator.discordUsername && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-5 py-4 text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <MessageCircle className="h-3.5 w-3.5" />
                Contact on Discord
              </p>
              <p className="mt-1 font-mono text-sm font-semibold">
                {creator.discordUsername}
              </p>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Artwork */}
      <section>
        <h2 className="mb-6 font-display text-2xl font-bold">
          Artwork{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({creator.artworkCount})
          </span>
        </h2>
        <ArtworkGrid
          artworks={creator.artworks}
          emptyTitle="No artwork yet"
          emptyDescription={`${creator.nickname} hasn't published any Map Art yet.`}
        />
      </section>

      {/* Reviews */}
      <section className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="mb-6 font-display text-2xl font-bold">
            Reviews{" "}
            <span className="text-base font-normal text-muted-foreground">
              ({creator.reviewCount})
            </span>
          </h2>
          <ReviewList reviews={creator.reviews} />
        </div>
        <div className="lg:pt-14">
          <ReviewForm
            creatorId={creator.userId}
            viewerId={viewerId}
            existing={viewerReview}
          />
        </div>
      </section>
    </div>
  );
}
