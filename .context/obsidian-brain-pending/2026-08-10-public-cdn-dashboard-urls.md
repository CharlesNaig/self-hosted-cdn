# Public CDN dashboard URLs — 2026-08-10

No matching CDN project folder or `Project Index.md` was present in the available
Obsidian vault, so this entry is pending copy into the appropriate project.

- Dashboard public asset actions now use the configured `PUBLIC_CDN_BASE_URL` plus the
  content-addressed `storedName`, not the private Tailnet dashboard origin.
- The resulting production URL is `https://cdn.naig.me/<storedName>` with no `/cdn/`
  segment after the public hostname.
- VIEW and COPY share the same helper; API management remains private/same-origin.
- Client tests (5), server tests (10), and a configured production Vite build passed.
