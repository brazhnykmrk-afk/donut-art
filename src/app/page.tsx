import Link from "next/link";
import { ArrowRight, Compass, MessageCircle, Palette, Upload } from "lucide-react";

import { ArtworkGrid } from "@/components/artwork/artwork-grid";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { listLatest } from "@/services/artwork-service";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Palette,
    title: "Create",
    description: "Build your Map Art on Donut SMP — pixel by pixel, map by map.",
  },
  {
    icon: Upload,
    title: "Showcase",
    description: "Upload a screenshot with a title and story. It appears in the gallery instantly.",
  },
  {
    icon: Compass,
    title: "Get discovered",
    description: "Players browse the gallery, check your profile and read your reviews.",
  },
  {
    icon: MessageCircle,
    title: "Connect",
    description: "Deals happen on Discord or in game — Donut Art just makes the introduction.",
  },
];

export default async function HomePage() {
  // The home page should render even before the database is provisioned
  // (first local run) — an empty gallery beats a crash here.
  const latest = await listLatest(8).catch(() => []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="container pt-20 md:pt-28">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            The Map Art hub for Donut SMP
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Where Donut SMP&apos;s finest <span className="text-gradient">Map Art</span>{" "}
            finds its audience
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/gallery">
                Browse the gallery
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Showcase your art</Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Latest artwork */}
      <section className="container">
        <FadeIn>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Fresh from the easel
              </h2>
              <p className="mt-1 text-muted-foreground">
                The latest Map Art from the community
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/gallery">
                View all
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </FadeIn>
        <ArtworkGrid
          artworks={latest}
          emptyTitle="The gallery is warming up"
          emptyDescription="No artwork has been uploaded yet. Be the first to showcase your Map Art!"
        />
      </section>

      {/* How it works */}
      <section className="container">
        <FadeIn className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            No payments, no middlemen — just artists and admirers
          </p>
        </FadeIn>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <FadeIn
              key={step.title}
              delay={index * 0.08}
              className="rounded-lg border border-border bg-card p-6 surface-glow"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <FadeIn className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/10 px-8 py-16 text-center surface-glow">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Your maps deserve a bigger canvas
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join the creators of Donut SMP, build your portfolio and let players
            find you.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/register">
              Create your free account
              <ArrowRight />
            </Link>
          </Button>
        </FadeIn>
      </section>
    </div>
  );
}
