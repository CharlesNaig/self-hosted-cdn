# Production hardening handoff

The public repository is now designed to contain application code and safe examples
only. Live origins, credentials, tailnet identifiers, deployment manifests, backup
archives, and local environment files belong outside the public repository.

The working branch is `agent/cdn-production-hardening`. Before merge, run the server,
client, repository-hygiene, landing-page, and Compose validation checks recorded in the
root context. Rotate any credential that may have existed in a previous public commit;
removing it from the current tree does not revoke it or erase Git history.

Do not publish the private security report. Report new issues through the private
contact process described in `SECURITY.md`.
