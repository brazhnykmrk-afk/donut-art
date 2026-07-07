import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** Minecraft nickname — the public identity on Donut Art. */
      nickname: string;
    } & DefaultSession["user"];
  }

  interface User {
    nickname?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    nickname?: string | null;
  }
}
