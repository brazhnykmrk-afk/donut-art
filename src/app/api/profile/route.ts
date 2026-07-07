import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validation/profile";
import { updateProfile } from "@/services/user-service";

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = updateProfileSchema.parse(body);
    const profile = await updateProfile(session.user.id, input);

    return NextResponse.json({
      minecraftNickname: profile.minecraftNickname,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
