# Private-First CDN Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the repository safe to run as a localhost-only private admin service plus a localhost-only, read-only public CDN gateway, without configuring external networking.

**Architecture:** The Express application owns metadata, private administrative routes, and internal file delivery. A separate nginx container is the only public-gateway candidate and permits only `GET`/`HEAD /cdn/*`; Docker exposes each service solely on loopback. MongoDB and file storage remain on private Docker networks and persistent named volumes.

**Tech Stack:** Node.js 20, Express, Mongoose, Multer disk storage, nginx, Docker Compose, Supertest, Node test runner.

---

### Task 1: Safe configuration and container boundary

**Files:**
- Modify: `.env.example`, `.gitignore`, `docker-compose.yml`, `server/Dockerfile`
- Create: `gateway/nginx.conf`, `gateway/Dockerfile`

- [ ] Replace secret-bearing example values with empty variable declarations and document only required names.
- [ ] Configure a private Docker network for MongoDB and application traffic, plus a separate gateway-to-app network.
- [ ] Remove MongoDB host publishing; publish `127.0.0.1:3000:3000` for the private application and `127.0.0.1:3001:8080` for the gateway.
- [ ] Add MongoDB, application, and gateway health checks, restart policies, named volumes, and `env_file: .env`.
- [ ] Configure nginx to reject all non-GET/HEAD methods and all paths except `/cdn/`, and to proxy valid requests to `app:3000`.

### Task 2: Application lifecycle, configuration, and security middleware

**Files:**
- Modify: `server/config.js`, `server/server.js`, `server/middleware/apiKeyAuth.js`
- Create: `server/app.js`, `server/middleware/logging.js`, `server/middleware/errors.js`, `server/routes/health.js`

- [ ] Build a testable `createApp` function separated from process startup.
- [ ] Fail production startup if `ADMIN_API_KEY`, `MONGO_URI`, storage configuration, or required quota/type settings are missing or invalid.
- [ ] Add JSON request/error logs, liveness and readiness endpoints, Mongo/storage readiness probes, and graceful SIGTERM/SIGINT shutdown.
- [ ] Compare API keys with a constant-time method and keep Serve-header trust disabled by default with explicit localhost-only safeguards.

### Task 3: Content-addressed, streamed upload and delivery

**Files:**
- Modify: `server/models/File.js`, `server/routes/upload.js`, `server/routes/files.js`, `server/utils/storage.js`
- Create: `server/routes/cdn.js`

- [ ] Use Multer disk storage in a protected temporary directory, hash the completed file by stream, validate claimed/derived types and extensions, enforce per-file and total quota, then atomically move it to a hash-derived filename.
- [ ] Make `sha256` unique in MongoDB and return an existing object on a duplicate-key race.
- [ ] Remove temporary and newly created files on all failed paths using the exact stored name.
- [ ] Mount the CDN route at `/cdn/:filename` outside `/api`, with GET/HEAD, safe path validation, immutable cache headers, ETag, length, modification time, `nosniff`, and attachment handling for unsafe types.

### Task 4: Real integration tests and dependency remediation

**Files:**
- Modify: `server/package.json`, `server/package-lock.json`, `server/tests/ping.test.js`
- Create: `server/tests/app.integration.test.js`, `server/tests/gateway.integration.test.js`, test support modules as needed

- [ ] Replace the mocked health test with tests against `createApp` and its real routers using a controlled temporary directory and test metadata repository.
- [ ] Cover health/readiness, API key auth, upload, duplicate upload, retrieval/HEAD, path validation, MIME and size rejection, delete auth, `/cdn` routing, `/api` isolation, and gateway method/path rejection.
- [ ] Apply non-major production dependency upgrades from `npm audit fix`, then rerun audit and tests.

### Task 5: Operations documentation and verification

**Files:**
- Modify: `README.md`, `MIXED_CONTENT_FIX.md`
- Create: `docs/operations.md`
- Delete: `client/netlify.toml`

- [ ] Replace obsolete Netlify/public-IP instructions with the future Serve/Funnel/Vercel boundary, explicitly without configuring them.
- [ ] Document backup, restore, volume location, local verification, health endpoints, routes, environment variables, and the raw-key authentication migration limitation.
- [ ] Run Compose validation, production build, full server test suite, and production npm audit.
