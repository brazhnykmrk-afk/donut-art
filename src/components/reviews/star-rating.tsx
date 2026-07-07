import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Read-only star display with optional numeric label. */
export function StarRating({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const starSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const rounded = Math.round(rating);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-muted-foreground">
          {count > 0 ? `${rating.toFixed(1)} · ${count} review${count === 1 ? "" : "s"}` : "No reviews yet"}
        </span>
      )}
    </div>
  );
}
