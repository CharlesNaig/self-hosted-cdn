# Private-first operations

This repository intentionally does not configure Vercel, Tailscale Serve, Tailscale Funnel, DNS, or a public hostname.

## Local configuration

Copy `.env.example` to `.env`, then populate every variable. Keep the key in a password manager and generate it with a cryptographically secure password generator. The initial safe upload allowlist is PNG, JPEG, WebP, GIF, and AVIF. SVG is disabled by default because it can contain active content; if explicitly enabled, delivery forces it to download.

```dotenv
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://mongo:27017/selfhostedcdn
ADMIN_API_KEY=<a long random secret>
STORAGE_PATH=/app/data/files
TEMP_STORAGE_PATH=/app/data/tmp
MAX_UPLOAD_SIZE_MB=25
STORAGE_QUOTA_MB=10240
MIN_FREE_DISK_MB=1024
ALLOWED_MIME_TYPES=image/png,image/jpeg,image/webp,image/gif,image/avif
ALLOWED_EXTENSIONS=png,jpg,webp,gif,avif
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
TRUST_TAILSCALE_IDENTITY=false
```

The raw API key is accepted only in the `x-api-key` header and is never bundled into Vite output. The UI keeps it in memory instead of `localStorage`. A future server-side session/Tailscale identity integration should replace the shared key; identity headers must remain untrusted until a verified localhost-only Tailscale Serve boundary exists.

## Routes

Private application (`127.0.0.1:3000`): `/api/upload`, `/api/files`, `/api/files/:id`, `/api/ping`, `/health/live`, `/health/ready`, and `/cdn/:identifier`.

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
Invoke-WebRequest http://127.0.0.1:3001/api/files # must return 404
docker compose logs --tail=100 app public-gateway mongo
docker compose down
```
