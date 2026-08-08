# Private Admin Gateway

No matching CDN project index was found in the Obsidian vault.

Add this note to the future CDN project folder:

- Private admin nginx gateway added on loopback port 3002.
- It serves the built Vite SPA and proxies `/api/*`, `/health/*`, and `/cdn/*` to the internal Express app.
- The dashboard uses same-origin requests; Tailnet clients do not contact the home server's loopback address directly.
- Public CDN gateway remains isolated on loopback port 3001 and only permits `GET`/`HEAD /cdn/*`.
- No Tailscale, Funnel, Vercel, or DNS configuration was changed.
