import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-8 w-8 text-primary" />
      </div>
      <h1 className="font-display text-4xl font-bold">404 — Lost in the void</h1>
      <p className="max-w-md text-muted-foreground">
        This page fell out of the world. The map you were looking for might have
        been moved or deleted.
      </p>
      <Button asChild>
        <Link href="/">Back to spawn</Link>
      </Button>
    </div>
  );
}
