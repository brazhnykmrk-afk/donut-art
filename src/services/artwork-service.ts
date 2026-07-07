import "server-only";

import { Prisma } from "@prisma/client";

import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { publicImageUrl } from "@/lib/storage";
import type {
  CreateArtworkInput,
  UpdateArtworkInput,
} from "@/lib/validation/artwork";
import { deleteStoredObject } from "@/services/storage-service";
import type { ArtworkCardData, ArtworkDetailData, Paginated } from "@/types";

export const GALLERY_PAGE_SIZE = 24;

const cardInclude = {
  author: {
    select: {
      id: true,
      profile: { select: { minecraftNickname: true, avatarKey: true } },
    },
  },
} satisfies Prisma.ArtworkInclude;

type ArtworkWithAuthor = Prisma.ArtworkGetPayload<{ include: typeof cardInclude }>;

function toCard(artwork: ArtworkWithAuthor): ArtworkCardData {
  return {
    id: artwork.id,
    title: artwork.title,
    price: artwork.price,
    imageUrl: publicImageUrl(artwork.imageKey),
    published: artwork.published,
    createdAt: artwork.createdAt.toISOString(),
    authorNickname: artwork.author.profile?.minecraftNickname ?? "Unknown",
    authorAvatarUrl: artwork.author.profile?.avatarKey
      ? publicImageUrl(artwork.author.profile.avatarKey)
      : null,
  };
}

/** Public gallery: published artwork, searchable by title or creator nickname. */
export async function listGallery(params: {
  query?: string;
  page?: number;
}): Promise<Paginated<ArtworkCardData>> {
  const query = params.query?.trim() ?? "";
  const page = Math.max(1, params.page ?? 1);

  const where: Prisma.ArtworkWhereInput = {
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            {
              author: {
                profile: {
                  minecraftNickname: { contains: query, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.artwork.findMany({
      where,
      include: cardInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * GALLERY_PAGE_SIZE,
      take: GALLERY_PAGE_SIZE,
    }),
    prisma.artwork.count({ where }),
  ]);

  return {
    items: rows.map(toCard),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE)),
  };
}

/** Latest published pieces for the home page. */
export async function listLatest(take = 8): Promise<ArtworkCardData[]> {
  const rows = await prisma.artwork.findMany({
    where: { published: true },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toCard);
}

/**
 * Single artwork. Unpublished pieces are only visible to their owner
 * (`viewerId`).
 */
export async function getArtworkById(
  id: string,
  viewerId?: string,
): Promise<ArtworkDetailData> {
  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          profile: {
            select: {
              minecraftNickname: true,
              avatarKey: true,
              discordUsername: true,
            },
          },
        },
      },
    },
  });

  if (!artwork || (!artwork.published && artwork.authorId !== viewerId)) {
    throw notFound("Artwork not found");
  }

  return {
    ...toCard(artwork),
    description: artwork.description,
    authorId: artwork.authorId,
    authorDiscord: artwork.author.profile?.discordUsername ?? null,
  };
}

/** Everything a creator uploaded — for their dashboard (includes drafts). */
export async function listByAuthor(authorId: string): Promise<ArtworkCardData[]> {
  const rows = await prisma.artwork.findMany({
    where: { authorId },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCard);
}

export async function createArtwork(authorId: string, input: CreateArtworkInput) {
  return prisma.artwork.create({
    data: {
      title: input.title,
      description: input.description,
      price: input.price || null,
      imageKey: input.imageKey,
      published: input.published,
      authorId,
    },
  });
}

async function getOwnedArtwork(id: string, userId: string) {
  const artwork = await prisma.artwork.findUnique({ where: { id } });
  if (!artwork) throw notFound("Artwork not found");
  if (artwork.authorId !== userId) {
    throw forbidden("You can only manage your own artwork.");
  }
  return artwork;
}

export async function updateArtwork(
  id: string,
  userId: string,
  input: UpdateArtworkInput,
) {
  const current = await getOwnedArtwork(id, userId);

  const updated = await prisma.artwork.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      // An empty string means "the price was removed".
      price: input.price === undefined ? undefined : input.price || null,
      published: input.published,
      imageKey: input.imageKey,
    },
  });

  // The image was replaced — remove the old object from storage.
  if (input.imageKey && input.imageKey !== current.imageKey) {
    void deleteStoredObject(current.imageKey);
  }

  return updated;
}

export async function deleteArtwork(id: string, userId: string) {
  const artwork = await getOwnedArtwork(id, userId);
  await prisma.artwork.delete({ where: { id } });
  void deleteStoredObject(artwork.imageKey);
}
