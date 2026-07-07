import { z } from "zod";

export const MINECRAFT_NICKNAME_REGEX = /^[A-Za-z0-9_]{3,16}$/;

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  minecraftNickname: z
    .string()
    .trim()
    .regex(
      MINECRAFT_NICKNAME_REGEX,
      "Nickname must be 3–16 characters: letters, numbers, underscores",
    ),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
