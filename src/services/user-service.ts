import "server-only";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { ServiceError, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { RegisterInput } from "@/lib/validation/auth";
import type { UpdateProfileInput } from "@/lib/validation/profile";
import { deleteStoredObject } from "@/services/storage-service";

const BCRYPT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const emailTaken = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (emailTaken) {
    throw new ServiceError(
      "EMAIL_TAKEN",
      "An account with this email already exists.",
      409,
    );
  }

  const nicknameTaken = await prisma.profile.findFirst({
    where: {
      minecraftNickname: { equals: input.minecraftNickname, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (nicknameTaken) {
    throw new ServiceError(
      "NICKNAME_TAKEN",
      "This Minecraft nickname is already registered.",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    // Nested create — user and profile are created atomically.
    return await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        profile: { create: { minecraftNickname: input.minecraftNickname } },
      },
      select: { id: true, email: true },
    });
  } catch (error) {
    // Unique constraint race (two simultaneous registrations).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ServiceError(
        "ALREADY_TAKEN",
        "This email or nickname is already registered.",
        409,
      );
    }
    throw error;
  }
}

/** Returns the user when email + password match, otherwise null. */
export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { profile: true },
  });

  if (!user) {
    // Burn comparable CPU time so response timing does not reveal whether
    // the email exists.
    await bcrypt.hash(password, BCRYPT_ROUNDS);
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export async function getProfileByUserId(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw notFound("Profile not found");
  return profile;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const current = await prisma.profile.findUnique({ where: { userId } });
  if (!current) throw notFound("Profile not found");

  const nicknameClash = await prisma.profile.findFirst({
    where: {
      minecraftNickname: { equals: input.minecraftNickname, mode: "insensitive" },
      NOT: { userId },
    },
    select: { id: true },
  });
  if (nicknameClash) {
    throw new ServiceError(
      "NICKNAME_TAKEN",
      "This Minecraft nickname is already registered.",
      409,
    );
  }

  const data: Prisma.ProfileUpdateInput = {
    minecraftNickname: input.minecraftNickname,
    discordUsername: input.discordUsername || null,
    bio: input.bio || null,
  };

  if (input.avatarKey !== undefined) {
    data.avatarKey = input.avatarKey;
    if (current.avatarKey && current.avatarKey !== input.avatarKey) {
      void deleteStoredObject(current.avatarKey);
    }
  }

  return prisma.profile.update({ where: { userId }, data });
}
