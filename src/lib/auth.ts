import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validation/auth";
import { verifyCredentials } from "@/services/user-service";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await verifyCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.minecraftNickname ?? null,
          nickname: user.profile?.minecraftNickname ?? null,
        };
      },
    }),
  ],
});

/** Returns the current session or throws — for API routes that require auth. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response(
      JSON.stringify({ error: { code: "UNAUTHORIZED", message: "You must be signed in." } }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  return session;
}
