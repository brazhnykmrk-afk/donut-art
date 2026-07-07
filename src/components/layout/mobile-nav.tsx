"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/creators", label: "Creators" },
];

const AUTH_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/upload", label: "Upload artwork" },
  { href: "/dashboard/settings", label: "Profile settings" },
];

export function MobileNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the menu on navigation.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background/95 p-4 backdrop-blur-xl animate-fade-up">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            {isAuthenticated ? (
              <>
                {AUTH_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Join now
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
