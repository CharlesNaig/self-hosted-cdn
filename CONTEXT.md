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
