import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

// Edge middleware: redirects unauthenticated visitors of /dashboard/* to
// /login (see the `authorized` callback in auth.config.ts).
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
