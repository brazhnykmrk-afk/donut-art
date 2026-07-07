import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Server-rendered prev/next pagination driven by the ?page= query param. */
export function Pagination({
  page,
  pageCount,
  basePath,
  query,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  query?: string;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="flex items-center justify-center gap-4 pt-10" aria-label="Pagination">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft />
        Previous
      </Link>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <Link
        href={href(page + 1)}
        aria-disabled={page >= pageCount}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page >= pageCount && "pointer-events-none opacity-40",
        )}
      >
        Next
        <ChevronRight />
      </Link>
    </nav>
  );
}
