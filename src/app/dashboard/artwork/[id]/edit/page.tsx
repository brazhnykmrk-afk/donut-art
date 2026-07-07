import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ArtworkForm } from "@/components/artwork/artwork-form";
import { auth } from "@/lib/auth";
import { ServiceError } from "@/lib/errors";
import { getArtworkById } from "@/services/artwork-service";
import type { ArtworkDetailData } from "@/types";

export const metadata: Metadata = { title: "Edit artwork" };
export const dynamic = "force-dynamic";

export default async function EditArtworkPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  let artwork: ArtworkDetailData;
  try {
    artwork = await getArtworkById(params.id, session?.user?.id);
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) notFound();
    throw error;
  }

  // Only the owner may open the edit form.
  if (artwork.authorId !== session?.user?.id) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Edit artwork</h2>
        <p className="mt-1 text-muted-foreground">
          Update “{artwork.title}”
        </p>
      </div>
      <ArtworkForm
        mode="edit"
        artwork={{
          id: artwork.id,
          title: artwork.title,
          description: artwork.description,
          price: artwork.price,
          imageUrl: artwork.imageUrl,
          published: artwork.published,
        }}
      />
    </div>
  );
}
