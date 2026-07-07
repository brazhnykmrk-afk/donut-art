import type { Metadata } from "next";
import Link from "next/link";
import { Images, Pencil, Star, Upload } from "lucide-react";

import { ArtworkCard } from "@/components/artwork/artwork-card";
import { DeleteArtworkButton } from "@/components/artwork/delete-artwork-button";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { listByAuthor } from "@/services/artwork-service";
import { getCreatorRating } from "@/services/review-service";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [artworks, rating] = await Promise.all([
    listByAuthor(userId),
    getCreatorRating(userId),
  ]);

  const publishedCount = artworks.filter((artwork) => artwork.published).length;

  const stats = [
    { icon: Images, label: "Artworks", value: String(artworks.length) },
    { icon: Upload, label: "Published", value: String(publishedCount) },
    {
      icon: Star,
      label: "Rating",
      value:
        rating.count > 0
          ? `${rating.average.toFixed(1)} (${rating.count})`
          : "—",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Artwork management */}
      {artworks.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Your gallery is empty"
          description="Upload your first Map Art and start building your portfolio."
        >
          <Button asChild className="mt-2">
            <Link href="/dashboard/upload">
              <Upload />
              Upload artwork
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="space-y-2">
              <ArtworkCard artwork={artwork} showStatus />
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/artwork/${artwork.id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex-1",
                  )}
                >
                  <Pencil />
                  Edit
                </Link>
                <DeleteArtworkButton artworkId={artwork.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
