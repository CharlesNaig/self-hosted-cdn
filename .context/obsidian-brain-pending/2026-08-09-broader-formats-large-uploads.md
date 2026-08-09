# Broader Formats and Large Uploads

No matching CDN project index exists in the Obsidian vault. Copy this note into the eventual CDN project folder.

- Explicit allowlist now supports common images, documents/text, archives, audio, video, and fonts.
- Uploads remain disk-backed and SHA-256 content-addressed.
- Risky formats are downloads, not inline browser content.
- The optional public CDN base URL affects only generated dashboard asset links; private API calls remain same-origin.
- Private nginx returns JSON for body-size rejections.
