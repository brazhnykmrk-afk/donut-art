import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration (no Prisma / bcrypt imports) so it can be
 * used from `middleware.ts`. The Credentials provider is added in
 * `src/lib/auth.ts`, which only runs in the Node.js runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Protects every route matched by `middleware.ts`.
      if (nextUrl.pathname.startsWith("/dashboard")) {
        return !!auth?.user;
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.nickname = user.nickname;
      }
      // Allows `update({ nickname })` after the user renames themselves.
      if (trigger === "update" && typeof session?.nickname === "string") {
        token.nickname = session.nickname;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nickname = (token.nickname as string) ?? "";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
