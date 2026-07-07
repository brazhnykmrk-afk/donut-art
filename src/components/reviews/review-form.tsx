"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  creatorId: string;
  /** null → visitor is not signed in; undefined never passed */
  viewerId: string | null;
  /** The viewer's existing review, if any — pre-fills the form. */
  existing?: { rating: number; comment: string } | null;
}

export function ReviewForm({ creatorId, viewerId, existing }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = React.useState(existing?.rating ?? 0);
  const [hovered, setHovered] = React.useState(0);
  const [comment, setComment] = React.useState(existing?.comment ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  if (!viewerId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <p className="text-sm text-muted-foreground">
            Log in to leave a review for this creator.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (viewerId === creatorId) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify({ creatorId, rating, comment }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {existing ? "Update your review" : "Leave a review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      star <= (hovered || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="How was working with this creator?"
              maxLength={1000}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && (
            <p className="text-sm text-emerald-400">Your review has been saved.</p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : existing ? "Update review" : "Submit review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
