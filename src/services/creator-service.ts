import "server-only";

import { prisma } from "@/lib/prisma";
import { publicImageUrl } from "@/lib/storage";
import { listByAuthor } from "@/services/artwork-service";
import { listReviewsForCreator } from "@/services/review-service";
import type { CreatorCardData, CreatorProfileData } from "@/types";

/** Average rating + review count for a set of creators in one query. */
async function ratingsByCreator(creatorIds: string[]) {
  if (creatorIds.length === 0) {
    return new Map<string, { average: number; count: number }>();
  }
  const grouped = await prisma.review.groupBy({
    by: ["creatorId"],
    where: { creatorId: { in: creatorIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    grouped.map((row) => [
      row.creatorId,
      { average: row._avg.rating ?? 0, count: row._count._all },
    ]),
  );
}

/** All creators, searchable by nickname, with artwork counts and ratings. */
export async function listCreators(query = ""): Promise<CreatorCardData[]> {
  const profiles = await prisma.profile.findMany({
    where: query
      ? { minecraftNickname: { contains: query.trim(), mode: "insensitive" } }
      : undefined,
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
          _count: {
            select: { artworks: { where: { published: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const ratings = await ratingsByCreator(profiles.map((p) => p.userId));

  return profiles.map((profile) => {
    const rating = ratings.get(profile.userId) ?? { average: 0, count: 0 };
    return {
      userId: profile.userId,
      nickname: profile.minecraftNickname,
      avatarUrl: profile.avatarKey ? publicImageUrl(profile.avatarKey) : null,
      bio: profile.bio,
      artworkCount: profile.user._count.artworks,
      averageRating: rating.average,
      reviewCount: rating.count,
      joinedAt: profile.user.createdAt.toISOString(),
    };
  });
}

/** Full public creator profile, or null when the nickname is unknown. */
export async function getCreatorByNickname(
  nickname: string,
): Promise<CreatorProfileData | null> {
  const profile = await prisma.profile.findFirst({
    where: { minecraftNickname: { equals: nickname, mode: "insensitive" } },
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
          _count: {
            select: { artworks: { where: { published: true } } },
          },
        },
      },
    },
  });
  if (!profile) return null;

  const [ratings, artworks, reviews] = await Promise.all([
    ratingsByCreator([profile.userId]),
    listByAuthor(profile.userId),
    listReviewsForCreator(profile.userId),
  ]);
  const rating = ratings.get(profile.userId) ?? { average: 0, count: 0 };

  return {
    userId: profile.userId,
    nickname: profile.minecraftNickname,
    avatarUrl: profile.avatarKey ? publicImageUrl(profile.avatarKey) : null,
    bio: profile.bio,
    discordUsername: profile.discordUsername,
    artworkCount: profile.user._count.artworks,
    averageRating: rating.average,
    reviewCount: rating.count,
    joinedAt: profile.user.createdAt.toISOString(),
    // Public profile shows published pieces only.
    artworks: artworks.filter((artwork) => artwork.published),
    reviews,
  };
}
