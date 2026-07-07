import { z } from "zod";

import { MINECRAFT_NICKNAME_REGEX } from "@/lib/validation/auth";

export const updateProfileSchema = z.object({
  minecraftNickname: z
    .string()
    .trim()
    .regex(
      MINECRAFT_NICKNAME_REGEX,
      "Nickname must be 3–16 characters: letters, numbers, underscores",
    ),
  discordUsername: z
    .string()
    .trim()
    .max(37, "Discord username is too long")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Biography must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  avatarKey: z.string().max(300).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
