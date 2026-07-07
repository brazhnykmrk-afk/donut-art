"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Upload } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserNav({ nickname }: { nickname: string }) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/upload">
          <Upload />
          Upload
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard">
          <LayoutDashboard />
          Dashboard
        </Link>
      </Button>
      <Link
        href="/dashboard"
        className="ml-1"
        aria-label="Open dashboard"
        title={nickname}
      >
        <Avatar className="h-9 w-9 border-primary/30">
          <AvatarFallback>{nickname.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sign out"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut />
      </Button>
    </div>
  );
}
