import { z } from "zod";

export const createReviewSchema = z.object({
  creatorId: z.string().min(1),
  rating: z.coerce
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .trim()
    .min(3, "Comment must be at least 3 characters")
    .max(1000, "Comment must be at most 1000 characters"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
