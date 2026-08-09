# Security Policy

## Supported version

Security updates are applied to the latest commit on the default branch.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting feature for this repository. Do not open a public issue containing credentials, private endpoints, personal data, uploaded objects, or step-by-step exploit details.

Include the affected path, impact, prerequisites, and a minimal reproduction that does not target a live system. You should receive an acknowledgement within seven days.

## Deployment boundary

Only the read-only public gateway is intended for Internet exposure. The Express administration service, dashboard gateway, MongoDB, secrets, runtime storage, backups, tunnel endpoints, and origin configuration must remain private.
