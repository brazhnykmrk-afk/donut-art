"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ImagePicker } from "@/components/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, uploadImage } from "@/lib/upload-client";

interface ArtworkFormProps {
  mode: "create" | "edit";
  artwork?: {
    id: string;
    title: string;
    description: string;
    price: string | null;
    imageUrl: string;
    published: boolean;
  };
}

/** Shared form for uploading new Map Art and editing existing pieces. */
export function ArtworkForm({ mode, artwork }: ArtworkFormProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState(artwork?.title ?? "");
  const [description, setDescription] = React.useState(artwork?.description ?? "");
  const [price, setPrice] = React.useState(artwork?.price ?? "");
  const [published, setPublished] = React.useState(artwork?.published ?? true);
  const [file, setFile] = React.useState<File | null>(null);
  const [imageCleared, setImageCleared] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "create" && !file) {
      setError("Please choose an image of your Map Art.");
      return;
    }
    if (mode === "edit" && imageCleared && !file) {
      setError("Please choose a new image, or keep the current one.");
      return;
    }

    setSubmitting(true);
    try {
      let imageKey: string | undefined;
      if (file) {
        const uploaded = await uploadImage(file, "artwork");
        imageKey = uploaded.key;
      }

      if (mode === "create") {
        const created = await apiRequest<{ id: string }>("/api/artworks", {
          method: "POST",
          body: JSON.stringify({ title, description, price, imageKey, published }),
        });
        router.push(`/artwork/${created.id}`);
      } else if (artwork) {
        await apiRequest(`/api/artworks/${artwork.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title,
            description,
            price,
            published,
            ...(imageKey ? { imageKey } : {}),
          }),
        });
        router.push(`/artwork/${artwork.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="space-y-2">
        <Label>Map Art image</Label>
        <ImagePicker
          initialUrl={mode === "edit" ? artwork?.imageUrl : null}
          onSelect={(selected) => {
            setFile(selected);
            if (!selected) setImageCleared(true);
          }}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="artwork-title">Title</Label>
          <Input
            id="artwork-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Sunset over the spawn"
            minLength={3}
            maxLength={100}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artwork-price">Price (optional)</Label>
          <Input
            id="artwork-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="e.g. 500k or 2 diamond blocks"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artwork-description">Description</Label>
          <Textarea
            id="artwork-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell the story of this piece: size in maps, how long it took, materials…"
            className="min-h-[160px]"
            maxLength={2000}
            required
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          <span>
            <span className="block text-sm font-medium">Publish to the gallery</span>
            <span className="block text-xs text-muted-foreground">
              Unchecked pieces stay private drafts, visible only to you.
            </span>
          </span>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Upload artwork"
                : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
