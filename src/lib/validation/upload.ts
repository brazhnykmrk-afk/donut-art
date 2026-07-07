import { z } from "zod";

/** MIME type → file extension for allowed image uploads. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export const signedUploadSchema = z.object({
  fileType: z.enum(["image/jpeg", "image/png", "image/webp"], {
    errorMap: () => ({ message: "Only JPEG, PNG and WebP images are allowed" }),
  }),
  fileSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_IMAGE_SIZE_BYTES, "Image must be at most 8 MB"),
  kind: z.enum(["artwork", "avatar"]),
});

export type SignedUploadInput = z.infer<typeof signedUploadSchema>;
