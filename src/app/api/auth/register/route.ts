import { NextResponse } from "next/server";

import { handleApiError, tooManyRequests } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/services/user-service";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000);
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const body = await request.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
