# CDN root landing page — 2026-08-09

No matching CDN project folder or `Project Index.md` was present in the available
Obsidian vault, so this entry is pending copy into the appropriate project.

- Added a root-only static CDN landing page in the repository root (`index.html`).
- Kept the external Vercel-managed CDN rewrite/proxy untouched; no DNS, Tailscale,
  Docker, or app routing was changed.
- Added static-page privacy/accessibility tests (`tests/cdn-landing.test.mjs`).
- Validation passed: landing tests (2), server tests (10), client tests (3), and Vite
  production build.
- Deployment follow-up: verify the root page and an existing asset URL after the next
  Vercel deployment, confirming cache/proxy behavior remains unchanged for assets.
