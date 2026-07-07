import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

const TABS = [
  { href: "/dashboard", label: "My artwork" },
  { href: "/dashboard/upload", label: "Upload" },
  { href: "/dashboard/settings", label: "Profile settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: middleware already guards /dashboard, but a broken
  // matcher must never expose these pages.
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold">
          Creator <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {session.user.nickname}
        </p>
      </div>

      <nav className="mb-10 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
