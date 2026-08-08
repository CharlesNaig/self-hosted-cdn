# Private-First Self-Hosted CDN

A local CDN file manager with a private administrative application and a separate read-only public-gateway candidate. This repository does **not** configure Vercel, Tailscale Serve, Tailscale Funnel, DNS, or a public hostname.

## Architecture

- `127.0.0.1:3000`: private Express administration/API application.
- `127.0.0.1:3001`: public nginx gateway that only permits `GET`/`HEAD /cdn/*`.
- `127.0.0.1:3002`: private nginx gateway serving the Vite dashboard and proxying private app routes.
- MongoDB: Docker-internal only; never published to the host.
- `mongo-data` and `cdn-files`: persistent Docker volumes.

Uploads require the server-side `x-api-key`, are written to a controlled temporary directory, validated, SHA-256 hashed, and persisted under immutable content-addressed names. The database enforces a unique SHA-256 index.

## Setup and verification

Copy `.env.example` to `.env`, populate every value, and follow the exact setup, backup, recovery, and verification instructions in [docs/operations.md](docs/operations.md).

Run the application tests:

```powershell
cd server
npm test
npm audit --omit=dev
```

## Security boundary

The Express app remains private. The private gateway serves the dashboard SPA and forwards `/api/*`, `/health/*`, and `/cdn/*` to Express over the internal Docker network. The only future public surface is the separate nginx gateway's `/cdn/*` read path; it never forwards `/api/*` or write methods. Do not add a Vercel rewrite to the admin API.
