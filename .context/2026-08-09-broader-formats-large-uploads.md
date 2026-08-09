# Broader Formats and Large Uploads Session

- Added a controlled MIME/extension matrix for images, documents/text, archives, audio, video, and fonts.
- Retained disk-backed temporary uploads and SHA-256 content-addressed storage.
- Added binary signatures and conservative text checks; archives are opaque and not malware-scanned.
- Added a safe delivery policy: SVG, text/structured data, and archives use attachment disposition; normal media remains inline-capable.
- Added private nginx `client_max_body_size` configuration and JSON 413 responses.
- Added defensive client response parsing so HTML proxy errors become clean HTTP messages.
- Added optional build-time `PUBLIC_CDN_BASE_URL` for asset previews and copied links; dashboard API calls remain same-origin.
- Verification: 10 server tests, 3 client tests, production Vite build, and Compose config validation passed.

No Tailscale, Funnel, Vercel, DNS, or port-routing configuration was changed.
