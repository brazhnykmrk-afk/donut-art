# Donut Art 🍩

Community website for the **Donut SMP** Minecraft server where players showcase
and discover **Map Art**. Donut Art is a discovery platform only — no payments,
no marketplace. All deals happen on Discord or in game.

## Tech stack

- **Next.js 14 (App Router)** + React 18 + TypeScript
- **Tailwind CSS** + shadcn/ui-style components + Framer Motion + Lucide icons
- **Prisma ORM** + **PostgreSQL**
- **Auth.js (NextAuth v5)** — email + password credentials, JWT sessions in HTTP-only cookies
- **Cloudflare R2** (any S3-compatible storage works) with signed direct-to-storage uploads
- REST API route handlers

## Project structure

```
donut-art/
├── prisma/
│   └── schema.prisma          # User, Profile, Artwork, Review models
├── public/
│   └── branding/              # Logo placeholders — replace files, no code changes
└── src/
    ├── app/                   # Routes (pages + REST API) — thin, no business logic
    │   ├── api/               #   REST endpoints (auth, artworks, uploads, reviews…)
    │   ├── (auth)/            #   /login, /register
    │   ├── dashboard/         #   Protected creator area (middleware + layout guard)
    │   ├── gallery/           #   Public gallery with search + pagination
    │   ├── creators/          #   Creator list + public profiles
    │   └── artwork/[id]/      #   Artwork detail page
    ├── components/            # UI: ui/ primitives, layout/, artwork/, reviews/…
    ├── config/                # Site config (name, logo paths, links)
    ├── lib/                   # Infrastructure: prisma, auth, storage, validation, rate-limit
    ├── services/              # Business logic (the only layer that touches Prisma)
    ├── types/                 # Shared view-model types
    └── middleware.ts          # Edge auth guard for /dashboard/*
```

**Layering rule:** pages and API handlers never contain business logic — they
validate input (Zod), check the session, call a service and render/serialize
the result. Services are the only code that queries the database.

## Getting started

### 1. Prerequisites

- Node.js 20+ (installed via `nvm` is fine)
- A PostgreSQL database — either of:
  - **Cloud (easiest, free):** create a database at [neon.tech](https://neon.tech)
    or [supabase.com](https://supabase.com) and copy its connection string;
  - **Local:** `brew install postgresql@16 && brew services start postgresql@16`,
    then `createdb donut_art`.
- A Cloudflare R2 bucket (free tier) — or any S3-compatible bucket.

### 2. Environment variables

Copy the template and fill it in:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Session signing secret — `openssl rand -base64 32` |
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token credentials |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | Public base URL of the bucket (r2.dev subdomain or custom domain) |

R2 setup: create the bucket, enable public access (or attach a custom domain),
create an API token with *Object Read & Write*, and add a **CORS policy** on
the bucket allowing `PUT` from your site origin (needed for direct browser
uploads):

```json
[{ "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
   "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"] }]
```

### 3. Install & run

```bash
npm install
npm run db:push      # create tables (or: npm run db:migrate for migration files)
npm run dev          # http://localhost:3000
```

Other commands: `npm run build` / `npm start` (production), `npm run lint`,
`npm run db:studio` (database browser).

## Replacing the logos

Drop the real images into `public/branding/` as `donut-art-logo.svg` and
`donut-smp-logo.svg` (PNG also works — then update the two paths in
`src/config/site.ts`). Nothing else changes.

## Deployment (Vercel)

1. Push the repository to GitHub.
2. In Vercel: **Add New Project** → import the repo. The framework preset
   (Next.js) is detected automatically; `postinstall` runs `prisma generate`.
3. Add all environment variables from the table above in
   *Project → Settings → Environment Variables* (use the production database
   URL; `AUTH_URL` is not needed on Vercel).
4. Deploy. Apply the schema to the production database once from your machine:
   ```bash
   DATABASE_URL="<production-url>" npx prisma db push
   ```
5. Add the deployed domain to the R2 bucket's CORS policy.

## Architectural decisions

- **Clean layering** — `app/` (delivery) → `services/` (business rules) →
  Prisma (data). Ownership checks (edit/delete artwork) and the review rules
  (no self-reviews, one review per creator per user) live in services, so every
  entry point enforces them identically.
- **Images in object storage, metadata in Postgres.** Uploads go straight from
  the browser to R2 via short-lived signed URLs that pin content type and
  size; the API stores only the object key. Public URLs are derived from
  `R2_PUBLIC_URL`, so switching storage providers is an env-var change.
- **Auth** — credentials provider with bcrypt (12 rounds), JWT session strategy
  in HTTP-only cookies. `middleware.ts` guards `/dashboard/*` at the edge, and
  the dashboard layout re-checks the session (defense in depth). The `Profile`
  model already reserves `minecraftUuid` / `verifiedAt` for future account
  verification.
- **Security** — Zod validation on every endpoint, per-user/IP rate limits on
  register/upload/review, file type & 8 MB size limits enforced server-side,
  generic 500s that never leak internals, and timing-equalized login checks.
- **Rate limiter is in-memory** by design for V1 (single instance). The
  function signature is store-agnostic — swap in Upstash Redis when scaling out.
- **Reviews use upsert** — "one review per creator per user" is a database
  unique constraint, and re-submitting updates your existing review.
