import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Donut Art logo. The image is a placeholder in /public/branding — replace
 * the file with the real logo (same file name) and nothing here changes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}
    >
      <Image
        src={siteConfig.logos.donutArt}
        alt={`${siteConfig.name} logo`}
        width={36}
        height={36}
        className="h-9 w-9 rounded-lg"
        priority
      />
      <span className="font-display text-lg font-bold tracking-tight">
        Donut<span className="text-primary">Art</span>
      </span>
    </Link>
  );
}

/** Donut SMP logo placeholder — same replace-the-file contract as above. */
export function DonutSmpLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={siteConfig.logos.donutSmp}
        alt="Donut SMP logo"
        width={24}
        height={24}
        className="h-6 w-6 rounded"
      />
      <span className="text-sm font-medium text-muted-foreground">Donut SMP</span>
    </span>
  );
}
