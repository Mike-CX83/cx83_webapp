# Staging deployment

The staging website runs on the existing DigitalOcean droplet `vaultstorage-pilot` (`157.245.247.90`) at `https://staging.cx83labs.com`. It is a separate Docker Compose project. It does not replace Coolify, the agent mailbox, n8n, DocuSeal, or the VaultStorage pilot.

Coolify's Traefik proxy terminates HTTPS and asks for a staging password before the site loads. Payload admin login and the owner MCP key stay in place behind that gate. The MCP port is not published to the internet. ChatGPT reaches it through the existing OpenAI tunnel, which runs on the droplet and adds the owner key locally.

## Capacity

Checked 2026-10-08. The droplet has 2 vCPU, 3.8 GiB RAM, and about 67 GiB of free disk. Existing services were already using a little over 2 GiB, with about 1.7 GiB available and no swap. Staging is capped so it cannot take the host down: Postgres 256 MiB, the website 1280 MiB, and the tunnel 128 MiB. A 2 GiB swap file at `/swapfile` is there so a short spike pages instead of killing another container. The Next.js image is built on GitHub Actions, not on the droplet.

Do not raise those limits or resize the droplet without checking the live memory numbers first.

## What is stored where

| Item | Location |
| --- | --- |
| Compose project | `/opt/cx83-webapp/compose.yml` |
| Runtime environment | `/opt/cx83-webapp/.env` mode 600 |
| Postgres data | `/opt/cx83-webapp/postgres` |
| Media uploads | `/opt/cx83-webapp/media` |
| Git checkout used by the code tools | `/opt/cx83-webapp/repo` |
| Tunnel profile and runtime key | `/opt/cx83-webapp/tunnel` |
| Staging gate password | `/opt/cx83-webapp/staging-gate.pass` |
| Traefik route | `/data/coolify/proxy/dynamic/cx83-webapp.yaml` |
| Backups | `/var/backups/cx83-webapp` |

Nothing in `/opt/cx83-webapp/.env` or the tunnel profile belongs in Git. `deploy/staging/env.example` lists the variable names.

## Repeat the deployment

1. Push the `staging-host` branch. The Staging image workflow builds `cx83-webapp:staging` for this domain and uploads it as an artifact. The existing CI workflow still has to pass on the pull request.
2. Download that artifact on a machine that can reach the droplet and load it:

```bash
gh run download --repo Mike-CX83/cx83_webapp --name cx83-webapp-staging
gzip -dc cx83-webapp-staging.tar.gz | ssh -i ~/.ssh/vaultstorage-pilot root@157.245.247.90 docker load
```

3. Copy `deploy/staging/compose.yml` to `/opt/cx83-webapp/compose.yml` and `deploy/staging/traefik.yaml` to `/data/coolify/proxy/dynamic/cx83-webapp.yaml`.
4. Keep `/opt/cx83-webapp/.env` filled from the local ignored `.env`, with these staging values:

- `DATABASE_URL` points at `cx83-webapp-postgres:5432/cx83_webapp_staging`. Use that container name. The hostname `postgres` on the Coolify network is Coolify's own database.
- `NEXT_PUBLIC_SERVER_URL=https://staging.cx83labs.com`
- `PAYLOAD_MCP_ENABLED=true`
- `CX83_REPO_ROOT=/repo`
- `PAYLOAD_DB_PUSH=false` after the database has been restored. Set it to `true` only to create the schema in an empty database that contains this app and nothing else.
- `AI_PROVIDER=openrouter` and the existing OpenRouter key and model.

5. DNS for `staging.cx83labs.com` is an unproxied A record to `157.245.247.90` in the Cloudflare zone `cx83labs.com`. Leave it DNS-only so Traefik's existing Let's Encrypt HTTP challenge can issue the certificate. Do not proxy this name through Cloudflare unless the origin certificate setup is changed on purpose.
6. Start Postgres, restore the website tables, then start the web container:

```bash
cd /opt/cx83-webapp
docker compose -f compose.yml up -d postgres
# restore a dump that excludes studio_* tables
docker compose -f compose.yml up -d web
```

7. The public site asks for the staging gate user `cx83` and the password in `staging-gate.pass`. Payload's existing owner account is unchanged because the database restore includes the users table and the server uses the same `PAYLOAD_SECRET`.
8. Install dependencies in the checkout so repository checks can run the same commands as CI:

```bash
docker run --rm --memory 1g -v /opt/cx83-webapp/repo:/repo -w /repo node:22.17.0-bookworm \
  bash -lc 'corepack enable && corepack prepare pnpm@11.28.5 --activate && pnpm install --frozen-lockfile'
```

9. Run one tunnel client for tunnel `tunnel_6ac83333598c81919c842108753202e9`. The server profile points MCP at `http://cx83-webapp:3000/api/mcp` and injects the owner bearer with `extra_headers`. Stop the Mac copy of `tunnel-client` before starting the server copy. They must not both poll the same tunnel.

```bash
docker compose -f /opt/cx83-webapp/compose.yml up -d tunnel
```

## Backups

`deploy/staging/backup.sh` writes a database dump and a media archive to `/var/backups/cx83-webapp` and deletes files older than 14 days. The server cron entry is:

```text
15 4 * * * /opt/cx83-webapp/backup.sh >> /var/log/cx83-webapp-backup.log 2>&1
```

## Repository checks

`runRepositoryCheck` starts `pnpm exec tsc --noEmit`, `pnpm lint`, or `pnpm test:int` in `/repo` and returns an id immediately. A second call with that id returns the exit code and output. Those commands are unchanged. An edit made by `applyRepositoryEdit` is written in `/opt/cx83-webapp/repo`. Commit and push that checkout, then let the existing GitHub Actions workflow validate it. Do not edit files inside the running image.

## Move this later

To place the same staging stack on another host, copy `/opt/cx83-webapp`, the Traefik file, and the cron entry. Point DNS at the new address, load the image, and start the compose project. Keep the tunnel profile with the containers so ChatGPT does not depend on a laptop.
