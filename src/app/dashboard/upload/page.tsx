import type { Metadata } from "next";

import { ArtworkForm } from "@/components/artwork/artwork-form";

export const metadata: Metadata = { title: "Upload artwork" };

export default function UploadArtworkPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Upload new Map Art</h2>
        <p className="mt-1 text-muted-foreground">
          Show the community what you&apos;ve built
        </p>
      </div>
      <ArtworkForm mode="create" />
    </div>
  );
}
