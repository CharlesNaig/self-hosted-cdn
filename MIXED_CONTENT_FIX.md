# Retired public-IP proxy configuration

The former Netlify redirects to a public IP address were removed. This project must not proxy administrative endpoints through Vercel or any public reverse proxy.

The future network design is intentionally not configured in this repository phase: private administration will use Tailscale Serve, while the isolated nginx gateway will be the only Funnel/Vercel upstream and will expose only `GET`/`HEAD /cdn/*`.
