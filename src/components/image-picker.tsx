"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validation/upload";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  /** Existing image URL when editing. */
  initialUrl?: string | null;
  onSelect: (file: File | null) => void;
  aspect?: "square" | "video";
  className?: string;
}

/** Drag-and-drop image picker with client-side type/size validation and preview. */
export function ImagePicker({
  initialUrl,
  onSelect,
  aspect = "square",
  className,
}: ImagePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(initialUrl ?? null);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const objectUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function applyFile(file: File | undefined) {
    setError(null);
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      setError("Only JPEG, PNG and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("The image must be at most 8 MB.");
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    onSelect(file);
  }

  function clear() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onSelect(null);
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => applyFile(event.target.files?.[0])}
      />

      {previewUrl ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-border",
            aspect === "square" ? "aspect-square" : "aspect-video",
          )}
        >
          {/* Blob preview URLs cannot go through the Next image optimizer. */}
          <Image
            src={previewUrl}
            alt="Selected image preview"
            fill
            unoptimized
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8"
            aria-label="Remove image"
            onClick={clear}
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            applyFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-secondary/30 p-10 text-center transition-colors",
            aspect === "square" ? "aspect-square" : "aspect-video",
            dragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-secondary/50",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ImagePlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Click to choose an image or drag it here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG or WebP · up to 8 MB
            </p>
          </div>
        </button>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
