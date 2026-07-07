/**
 * The public hostname of the image storage (Cloudflare R2 public bucket or
 * custom domain) is derived from the R2_PUBLIC_URL environment variable so
 * that switching storage providers requires no code changes.
 */
function storageHostname() {
  try {
    return new URL(process.env.R2_PUBLIC_URL ?? "").hostname;
  } catch {
    return null;
  }
}

const hostname = storageHostname();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob public stores
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      ...(hostname
        ? [{ protocol: "https", hostname }]
        : [{ protocol: "https", hostname: "**" }]),
    ],
  },
};

export default nextConfig;
