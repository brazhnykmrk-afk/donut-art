import { MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StarRating } from "@/components/reviews/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ReviewData } from "@/types";

export function ReviewList({ reviews }: { reviews: ReviewData[] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Be the first to share your experience with this creator."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {review.authorAvatarUrl && (
                    <AvatarImage src={review.authorAvatarUrl} alt={review.authorNickname} />
                  )}
                  <AvatarFallback>{review.authorNickname.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{review.authorNickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
