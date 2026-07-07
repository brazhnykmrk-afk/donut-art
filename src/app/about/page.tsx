import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  return (
    <div className="container py-16">
      <FadeIn className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          About <span className="text-gradient">Us</span>
        </h1>

        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>
            Welcome to <strong className="text-foreground">Donut Art</strong>!
          </p>
          <p>
            My name is <strong className="text-foreground">Mark</strong>, I&apos;m{" "}
            <strong className="text-foreground">13 years old</strong>, and I&apos;m
            the creator of this website.
          </p>
          <p>
            I built Donut Art because I wanted to make it easier for the Donut
            SMP community to discover talented Map Art creators and showcase
            their amazing work. Instead of searching through Discord messages
            or in-game chat, players can browse artists, explore their
            galleries, and quickly find the artwork they&apos;re looking for.
          </p>
          <p>
            Donut Art is a community-driven platform made by a Minecraft player
            for Minecraft players. My goal is to support creators, help them
            reach more people, and make buying and selling Map Art on Donut SMP
            simpler and more enjoyable.
          </p>
          <p>
            This project is built with passion, and I&apos;ll continue improving
            it with new features and ideas based on feedback from the community.
          </p>
          <p>
            Thank you for visiting Donut Art, and I hope you enjoy using it!
          </p>
        </div>

        <div className="mt-10">
          <Button size="lg" asChild>
            <Link href="/gallery">
              Explore the gallery
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
