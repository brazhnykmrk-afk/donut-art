import "server-only";

import { ServiceError, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { publicImageUrl } from "@/lib/storage";
import type { CreateReviewInput } from "@/lib/validation/review";
import type { ReviewData } from "@/types";

/**
 * Creates the reviewer's review for a creator, or updates it if one already
 * exists — this enforces the "one review per creator per user" rule while
 * letting people revise their opinion.
 */
export async function submitReview(authorId: string, input: CreateReviewInput) {
  if (authorId === input.creatorId) {
    throw new ServiceError(
      "SELF_REVIEW",
      "You cannot review yourself.",
      400,
    );
  }

  const creator = await prisma.user.findUnique({
    where: { id: input.creatorId },
    select: { id: true },
  });
  if (!creator) throw notFound("Creator not found");

  return prisma.review.upsert({
    where: {
      authorId_creatorId: { authorId, creatorId: input.creatorId },
    },
    create: {
      authorId,
      creatorId: input.creatorId,
      rating: input.rating,
      comment: input.comment,
    },
    update: {
      rating: input.rating,
      comment: input.comment,
    },
  });
}

/** The viewer's own review of a creator — used to pre-fill the review form. */
export async function getViewerReview(creatorId: string, authorId: string) {
  return prisma.review.findUnique({
    where: { authorId_creatorId: { authorId, creatorId } },
    select: { rating: true, comment: true },
  });
}

export async function getCreatorRating(creatorId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { creatorId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return {
    average: aggregate._avg.rating ?? 0,
    count: aggregate._count._all,
  };
}

export async function listReviewsForCreator(
  creatorId: string,
): Promise<ReviewData[]> {
  const reviews = await prisma.review.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          profile: { select: { minecraftNickname: true, avatarKey: true } },
        },
      },
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    authorId: review.author.id,
    authorNickname: review.author.profile?.minecraftNickname ?? "Unknown",
    authorAvatarUrl: review.author.profile?.avatarKey
      ? publicImageUrl(review.author.profile.avatarKey)
      : null,
  }));
}
