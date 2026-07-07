import Link from "next/link";

import { DonutSmpLogo, Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="container flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
          <DonutSmpLogo />
        </div>

        <div className="flex gap-16">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Explore
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/gallery" className="text-muted-foreground transition-colors hover:text-primary">
                Gallery
              </Link>
              <Link href="/creators" className="text-muted-foreground transition-colors hover:text-primary">
                Creators
              </Link>
            </nav>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/register" className="text-muted-foreground transition-colors hover:text-primary">
                Create account
              </Link>
              <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-primary">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. A community project — not
            affiliated with Mojang or Microsoft.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="transition-colors hover:text-primary">
              About us
            </Link>
            <p>
              Play with us: <span className="font-mono text-primary">{siteConfig.links.serverIp}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
