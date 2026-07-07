/**
 * Central site configuration.
 *
 * Logo files are plain assets in /public/branding — replace the files with
 * the real logos (keeping the same file names) and no code changes are
 * needed. To use different file names, only edit the paths below.
 */
export const siteConfig = {
  name: "Donut Art",
  tagline: "Map Art gallery for Donut SMP",
  description:
    "Discover and showcase Minecraft Map Art created by the Donut SMP community. Browse the gallery, find artists and reach them on Discord or in game.",
  logos: {
    donutArt: "/branding/donut-art-logo.svg",
    donutSmp: "/branding/donut-smp-logo.svg",
  },
  links: {
    serverIp: "play.donutsmp.net",
  },
} as const;
