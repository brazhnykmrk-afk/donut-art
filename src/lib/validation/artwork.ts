import { z } from "zod";

export const createArtworkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be at most 2000 characters"),
  price: z
    .string()
    .trim()
    .max(50, "Price must be at most 50 characters")
    .optional()
    .or(z.literal("")),
  imageKey: z.string().min(1, "Image is required").max(300),
  published: z.boolean().default(true),
});

export const updateArtworkSchema = createArtworkSchema.partial();

export const gallerySearchSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>;
