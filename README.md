# KnownIssues.co.uk

A guide marketplace: users register, verify their email, and download PDF buyers guides — rate-limited per user and per IP.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database / Auth | Supabase (Postgres + Auth) |
| Transactional email | Resend + React Email |
| File storage | Cloudflare R2 (via `@aws-sdk/client-s3`, S3-compatible API) |
| Validation | Zod |
| Hosting | Vercel |

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → `service_role` key. **Server-only — never expose to the browser.** |
| `RESEND_API_KEY` | Resend dashboard → API Keys |
| `NEXT_PUBLIC_SITE_URL` | The deployed site URL, e.g. `https://knownissues.co.uk` (use `http://localhost:3000` locally) |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare dashboard → R2 → Overview (account ID shown in the right-hand panel) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Cloudflare dashboard → R2 → Manage API Tokens → create a token |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Shown once when the R2 API token is created — store it immediately |
| `CLOUDFLARE_R2_BUCKET_NAME` | The name of the R2 bucket holding the guide PDFs |
| `ADMIN_EMAIL` | The single email address allowed to access `/admin` |

In Vercel, add the same variables under **Project Settings → Environment Variables** for the Production (and Preview, if used) environment. Don't commit `.env.local` — it's gitignored.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

App runs at `http://localhost:3000`.

## Running the database migration

The schema lives in `supabase/migrations/001_initial_schema.sql`. It creates `users_profile`, `guides`, `downloads`, and `verification_tokens`, enables RLS with appropriate policies, adds a trigger that auto-creates a `users_profile` row on signup, and seeds one test guide.

**Option A — Supabase SQL Editor**
1. Open your project at supabase.com → SQL Editor → New query
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run

**Option B — Supabase CLI**
```bash
brew install supabase/tap/supabase
supabase link --project-ref <your-project-ref>
supabase db push
```

## Download rate limiting

Each guide can be downloaded once per **30 days**, enforced two ways on every request to `POST /api/guides/[slug]/download`:

1. **Per user** — the `downloads` table is checked for a row matching the current `user_id` and `guide_id` within the last 30 days.
2. **Per IP address** — the same table is checked for the requester's IP address against the same `guide_id` within the last 30 days (catches multiple accounts sharing a connection).

If either check finds a recent download, the request is rejected with a `429` and a message telling the user the exact date they can download again (30 days from their last download). If both checks pass:

1. The guide's raw PDF bytes are fetched from Cloudflare R2 into memory (`lib/r2.ts`, `getObjectBuffer`).
2. The PDF is watermarked server-side with `pdf-lib` (`lib/watermark.ts`) — a diagonal "KnownIssues.co.uk" mark on every page, plus a footer identifying the downloading user's email. Nothing watermarked is written back to R2; it's regenerated fresh on every request.
3. The download is logged to the `downloads` table (`user_id`, `guide_id`, timestamp, IP address).
4. The same watermarked PDF is emailed to the user via Resend as an attachment (backup copy).
5. The watermarked PDF is streamed back to the client directly as the response body (`Content-Type: application/pdf`, `Content-Disposition: attachment`), triggering the browser download.

## Project structure

```
app/             pages and routes (App Router)
app/api/         API route handlers
components/      reusable UI components
emails/          React Email templates
lib/             Supabase clients, R2 client, email sending, admin guard
types/           shared TypeScript types
supabase/        SQL migrations
```

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel ([vercel.com/new](https://vercel.com/new)) — it auto-detects Next.js.
3. Add all environment variables listed above under Project Settings → Environment Variables.
4. Deploy. `vercel.json` pins the framework preset, build/install commands, and adds basic security headers.
