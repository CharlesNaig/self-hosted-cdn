# Current Project Context

## Project

Private-first self-hosted CDN: Express/MongoDB administration, a public read-only nginx CDN gateway, and a private Vite admin nginx gateway.

## Current state

- `public-gateway` remains loopback-only on port 3001 and permits only `GET`/`HEAD /cdn/*`.
- `private-admin-gateway` is loopback-only on port 3002, serves the production Vite SPA, and proxies `/api/*`, `/health/*`, and `/cdn/*` to `app:3000` on the internal gateway Docker network.
- The client uses same-origin API URLs; no Vite environment API URL is used in production.
- The client can use the optional build-time `PUBLIC_CDN_BASE_URL` for CDN previews and copied URLs while API calls remain same-origin.
- Upload validation supports configured images, documents/text, archives, audio, video, and fonts using disk-backed temporary storage; active/risky types are forced to download.
- No Vercel, Tailscale Serve/Funnel, DNS, or public routing configuration was changed in this repository session.

## Verification

- `server/npm test`: 10 passing tests.
- `client/npm test`: 3 passing tests.
- `client/npm run build`: passed.
- `docker compose config --quiet`: passed with temporary validation values and `.env.example` selected as the Compose env-file.

## Remaining work

- Start/rebuild the Compose stack on the host and verify port 3002 before changing the existing Tailscale Serve target from 3000 to 3002.
- Do not expose the private-admin gateway through Funnel.
- Rebuild the stack with the real `.env` and verify the configured large upload limit through the private gateway before changing any networking.

## 2026-08-09 — CDN public root landing page

- Added a root-level static `index.html` for the public CDN domain. It is intentionally
  limited to a small informational page and has no JavaScript, trackers, external
  resources, or private infrastructure details.
- No Vercel rewrite, proxy, DNS, Tailscale, Docker, or application route configuration
  was changed. The repository has no checked-in Vercel configuration; the existing
  externally managed CDN rewrite remains responsible for non-filesystem asset paths.
- Added `tests/cdn-landing.test.mjs` to assert the document is static, accessible, and
  does not contain prohibited upstream or private-infrastructure references.

### Landing page verification

- `node --test tests/cdn-landing.test.mjs`: 2 passing tests.
- `server npm test`: 10 passing tests.
- `client npm test`: 3 passing tests.
- `client npm run build`: passed.

## 2026-08-10 — Public asset URLs in the private dashboard

- Centralized public-asset URL construction in `client/src/api.js`. It uses the
  authoritative content-addressed `storedName`, safely URL-encodes it, and removes
  trailing slashes from `VITE_PUBLIC_CDN_BASE_URL`.
- With `PUBLIC_CDN_BASE_URL=https://cdn.naig.me`, previews, VIEW, and COPY URL use
  `https://cdn.naig.me/<storedName>`; they no longer use the private admin origin or
  include `/cdn/` after the public base.
- API requests and file-management operations remain private same-origin `/api/*`
  requests. No Tailscale, Funnel, Serve, nginx, MongoDB, Docker, or Vercel routing
  configuration was changed.

### Public URL verification

- `client npm test`: 5 passing tests, including configured base, normalization,
  VIEW/COPY consistency, URL encoding, and development fallback.
- `server npm test`: 10 passing tests.
- `VITE_PUBLIC_CDN_BASE_URL=https://cdn.naig.me/ client npm run build`: passed.

## 2026-08-10 — Public CDN favicon

- Added the requested public PNG asset as the favicon for the static
  `vercel-proxy` landing page.
- Kept the proxy rewrite, Tailscale, Docker, and private-admin configuration unchanged.
- Updated the landing-page test to target the actual proxy static page and allow only
  the explicit public favicon URL as an external resource.

### Favicon verification

- `node --test tests/cdn-landing.test.mjs`: 2 passing tests.
