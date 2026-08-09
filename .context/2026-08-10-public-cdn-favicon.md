# Public CDN favicon — 2026-08-10

## Scope

Added the user-provided public PNG favicon to the static landing page served by the
Vercel proxy project.

## Changes

- Added a PNG favicon `<link>` to `vercel-proxy/index.html` pointing at the supplied
  `https://cdn.naig.me/...png` asset URL.
- Updated the landing-page test to read `vercel-proxy/index.html`, the actual static
  Vercel project surface, and to allow the explicitly requested favicon resource.
- Did not change `vercel-proxy/vercel.json`, proxy rewrites, Tailscale, Docker, nginx,
  MongoDB, or admin behavior.

## Verification

- `node --test tests/cdn-landing.test.mjs`: 2 passed.
- `git diff --check`: passed.
