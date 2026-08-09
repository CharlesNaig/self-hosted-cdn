# Public CDN dashboard URLs — 2026-08-10

## Scope

Updated only the private Vite dashboard’s public-asset presentation actions. No
private API, Tailscale, nginx, Docker, MongoDB, or Vercel routing was changed.

## Changes

- Replaced path-based `getCdnUrl` usage with one `getPublicAssetUrl(file)` helper.
- The helper uses `file.storedName` (the content-addressed backend identifier), trims
  and normalizes the configured public base, URL-encodes the identifier, and returns
  `https://cdn.naig.me/<storedName>` when the build receives
  `VITE_PUBLIC_CDN_BASE_URL=https://cdn.naig.me`.
- Image previews, VIEW, and COPY URL share that single value.
- VIEW retains `target="_blank"` and `rel="noopener noreferrer"`.
- COPY no longer constructs a URL from `window.location.origin`; it copies exactly the
  same public URL used by VIEW.
- If no public base is configured, local development falls back to `/cdn/<storedName>`.
- `/api/*` upload, list, and delete requests remain same-origin and private.

## Verification

- Client test suite: 5 passed.
- Server test suite: 10 passed.
- Production Vite build with `VITE_PUBLIC_CDN_BASE_URL=https://cdn.naig.me/`: passed.

## Follow-up

Rebuild `private-admin-gateway` with `.env` containing
`PUBLIC_CDN_BASE_URL=https://cdn.naig.me`, then confirm a listed file’s VIEW and COPY
URL actions use the public origin without `/cdn/`.
