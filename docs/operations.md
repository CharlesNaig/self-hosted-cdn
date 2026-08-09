# Private-first operations

This repository intentionally does not configure Vercel, Tailscale Serve, Tailscale Funnel, DNS, or a public hostname.

## Local configuration

Copy `.env.example` to `.env`, then populate every variable. Keep the key in a password manager and generate it with a cryptographically secure password generator. SVG is allowed only when included in the explicit allowlist and is always forced to download because it can contain active content.

```dotenv
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://mongo:27017/selfhostedcdn
ADMIN_API_KEY=<a long random secret>
STORAGE_PATH=/app/data/files
TEMP_STORAGE_PATH=/app/data/tmp
MAX_UPLOAD_SIZE_MB=1024
STORAGE_QUOTA_MB=102400
MIN_FREE_DISK_MB=1024
ALLOWED_MIME_TYPES=image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml,application/pdf,text/plain,text/markdown,text/csv,application/json,application/xml,text/xml,application/zip,application/x-7z-compressed,application/vnd.rar,application/x-tar,application/gzip,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/flac,video/mp4,video/webm,video/quicktime,video/x-matroska,font/woff,font/woff2,font/ttf,font/otf
ALLOWED_EXTENSIONS=png,jpg,jpeg,webp,gif,avif,svg,pdf,txt,md,csv,json,xml,zip,7z,rar,tar,gz,mp3,wav,ogg,m4a,flac,mp4,webm,mov,mkv,woff,woff2,ttf,otf
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
TRUST_TAILSCALE_IDENTITY=false
PUBLIC_CDN_BASE_URL=
NGINX_CLIENT_MAX_BODY_SIZE=1g
```

The raw API key is accepted only in the `x-api-key` header and is never bundled into Vite output. The UI keeps it in memory instead of `localStorage`. A future server-side session/Tailscale identity integration should replace the shared key; identity headers must remain untrusted until a verified localhost-only Tailscale Serve boundary exists.

`MAX_UPLOAD_SIZE_MB` is enforced by Express/Multer with disk-backed temporary uploads. `NGINX_CLIENT_MAX_BODY_SIZE` is the private gateway’s outer limit and should be at least as large as `MAX_UPLOAD_SIZE_MB`; its 413 responses are JSON so the dashboard can display a clear message. `PUBLIC_CDN_BASE_URL` is optional and is injected when the private gateway image is built. Set it only to the eventual public CDN origin (for example, `https://cdn.naig.me`); previews, VIEW, and COPY URL then use `${PUBLIC_CDN_BASE_URL}/${storedName}` without a `/cdn/` segment.

## Supported file formats and delivery policy

The supported matrix is PNG/JPEG (`.jpg` and `.jpeg`)/WebP/GIF/AVIF/SVG; PDF, TXT, Markdown, CSV, JSON, XML; ZIP, 7z, RAR, TAR, GZ; MP3, WAV, OGG, M4A, FLAC; MP4, WebM, MOV, MKV; and WOFF/WOFF2/TTF/OTF.

Binary formats are signature-checked where practical. Plain-text formats are validated as text, JSON is parsed, XML/SVG must have matching markup, and WebM/MKV are distinguished by their configured MIME plus EBML container signature. Archives are stored and served as opaque objects—they are not extracted or malware-scanned.

PNG/JPEG/WebP/GIF/AVIF/PDF/audio/video/fonts may be served inline. SVG, Markdown, CSV, JSON, XML, and archives are always sent with `Content-Disposition: attachment`; all objects retain `X-Content-Type-Options: nosniff`, immutable caching, ETags, and the persisted MIME type.

## Routes

Private Express application (`127.0.0.1:3000`): `/api/upload`, `/api/files`, `/api/files/:id`, `/api/ping`, `/health/live`, `/health/ready`, and `/cdn/:identifier`.

Private admin gateway (`127.0.0.1:3002`): serves the compiled Vite dashboard with SPA fallback and proxies `/api/*`, `/health/*`, and `/cdn/*` to the Express application. The dashboard uses same-origin `/api/*` requests, so Tailnet browsers never need access to the host's loopback address.

Future public gateway (`127.0.0.1:3001`): only `GET` and `HEAD` below `/cdn/`. It rejects `/api/*`, other paths, and every write method.

## Storage and recovery

`mongo-data` contains metadata and `cdn-files` contains immutable CDN objects and temporary uploads. Back up both named volumes together. Restore Mongo metadata and the matching file volume as one unit; restoring one without the other can leave metadata and objects inconsistent.

Uploads first go to `/app/data/tmp`, are type-checked and hashed without loading their full content into Node memory, then move to `/app/data/files/<sha256>.<extension>`. The database unique SHA-256 index is authoritative for duplicate races. Temporary files and newly created, unreferenced objects are cleaned up after errors.

## Local verification

```powershell
docker compose config
docker compose build
docker compose up -d
docker compose ps
Invoke-WebRequest http://127.0.0.1:3000/health/live
Invoke-WebRequest http://127.0.0.1:3000/health/ready
Invoke-WebRequest http://127.0.0.1:3002/
Invoke-WebRequest http://127.0.0.1:3002/health/live
Invoke-WebRequest http://127.0.0.1:3001/api/files # must return 404
docker compose logs --tail=100 app public-gateway mongo
docker compose down
```
