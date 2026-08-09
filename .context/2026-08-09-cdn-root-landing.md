# CDN root landing page — 2026-08-09

## Scope

Created a static public landing page for the root of `cdn.naig.me` without changing
the existing externally managed Vercel CDN rewrite or any Tailscale configuration.

## Changes

- Added root `index.html` with embedded CSS only.
- The page contains the requested Naig/CDN status and delivery information, using a
  restrained dark infrastructure style with system fonts and responsive layout.
- Added `tests/cdn-landing.test.mjs` to verify the static document, required content,
  semantic structure, and absence of upstream/private infrastructure references.

## Routing assumption

The repository has no checked-in `vercel.json`, `.vercel` project link, or Vercel CLI
configuration. Vercel serves static filesystem output before rewrites, so the root
`index.html` is the smallest root override while the existing dashboard-managed
catch-all CDN rewrite continues to handle non-file asset paths.

## Verification

- `node --test tests/cdn-landing.test.mjs`: 2 passed.
- `server npm test`: 10 passed.
- `client npm test`: 3 passed.
- `client npm run build`: passed.

## Follow-up

After deployment, manually verify `https://cdn.naig.me/` and one already-known public
asset URL, including that the asset response/cache headers are unchanged.
