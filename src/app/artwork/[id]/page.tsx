import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MessageCircle, Pencil, Tag } from "lucide-react";

import { DeleteArtworkButton } from "@/components/artwork/delete-artwork-button";
import { FadeIn } from "@/components/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { ServiceError } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import { getArtworkById } from "@/services/artwork-service";
import type { ArtworkDetailData } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function ArtworkPage({ params }: PageProps) {
  const session = await auth();

  let artwork: ArtworkDetailData;
  try {
    artwork = await getArtworkById(params.id, session?.user?.id);
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) notFound();
    throw error;
  }

  const isOwner = session?.user?.id === artwork.authorId;

  return (
    <div className="container py-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Image */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary surface-glow">
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              width={1200}
              height={1200}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </FadeIn>

        {/* Details */}
        <FadeIn delay={0.1} className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold">{artwork.title}</h1>
              {!artwork.published && <Badge variant="muted">Draft</Badge>}
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Uploaded {formatDate(artwork.createdAt)}
            </p>
            {artwork.price && (
              <Badge className="text-sm">
                <Tag className="h-3.5 w-3.5" />
                {artwork.price}
              </Badge>
            )}
          </div>

          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {artwork.description}
          </p>

          {/* Creator card */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <Link
                href={`/creators/${encodeURIComponent(artwork.authorNickname)}`}
                className="group flex items-center gap-4"
              >
                <Avatar className="h-12 w-12 border-primary/30">
                  {artwork.authorAvatarUrl && (
                    <AvatarImage
                      src={artwork.authorAvatarUrl}
                      alt={artwork.authorNickname}
                    />
                  )}
                  <AvatarFallback>
                    {artwork.authorNickname.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display font-semibold group-hover:text-primary">
                    {artwork.authorNickname}
                  </p>
                  <p className="text-xs text-muted-foreground">View profile →</p>
                </div>
              </Link>

              {artwork.authorDiscord && (
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Discord
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold">
                    {artwork.authorDiscord}
                  </p>
                </div>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                Interested in this piece? Reach out on Discord or find{" "}
                {artwork.authorNickname} on the Donut SMP server — all deals
                happen outside Donut Art.
              </p>
            </CardContent>
          </Card>

          {isOwner && (
            <div className="flex gap-3 border-t border-border pt-6">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/artwork/${artwork.id}/edit`}>
                  <Pencil />
                  Edit
                </Link>
              </Button>
              <DeleteArtworkButton artworkId={artwork.id} redirectTo="/dashboard" />
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
