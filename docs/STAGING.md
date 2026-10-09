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
| Tunnel profile | `/opt/cx83-webapp/tunnel` |
| Tunnel runtime environment | `/opt/cx83-webapp/tunnel.env` mode 600. `CONTROL_PLANE_API_KEY` and `PAYLOAD_MCP_AUTHORIZATION`. Not in Git. |
| Staging gate password | `/opt/cx83-webapp/staging-gate.pass` |
| Traefik route | `/data/coolify/proxy/dynamic/cx83-webapp.yaml` |
| Backups | `/var/backups/cx83-webapp` |

Nothing in `/opt/cx83-webapp/.env` or the tunnel profile belongs in Git. `deploy/staging/env.example` lists the variable names.

## Automatic deployment

A commit that lands on `staging-host` starts `.github/workflows/staging-image.yml`. The workflow runs the same typecheck, lint, tests, and build as CI. If those pass, it builds `cx83-webapp:staging` and sends that image to the droplet. A pull request into `staging-host` runs the tests and does not deploy. A push to `main` does not deploy. This is not a public production release.

The GitHub Actions secrets are `STAGING_DEPLOY_SSH_KEY`, `STAGING_DEPLOY_HOST`, and `STAGING_DEPLOY_USER`. The key belongs to the server user `cx83-deploy`. That user can run only `/opt/cx83-webapp/deploy-incoming.sh`. The script loads the image, keeps the image that was running as `cx83-webapp:staging-previous`, and recreates the `web` service. It does not recreate Postgres, the tunnel, Coolify, the mailbox, n8n, DocuSeal, or the VaultStorage containers. It does not replace `/opt/cx83-webapp/.env`, `tunnel.env`, the gate password, media, the database directory, or `/var/backups/cx83-webapp`.

The script then asks the new container for the homepage, checks that `https://staging.cx83labs.com` still asks for the staging password, and checks that the password still opens the site. If the homepage includes the banner file, that file and its optimized image must answer. If any of those checks fail, the script tags `cx83-webapp:staging-previous` back to `cx83-webapp:staging`, starts that image, and the workflow fails.

After those checks pass, the script runs the guarded checkout sync inside the new container. The image carries `CX83_DEPLOYED_SHA` and a git bundle of that exact commit at `/app/.cx83-staging-source.bundle`. The sync fast-forwards `/opt/cx83-webapp/repo` to that commit when the checkout is on `staging-host`, the origin is `Mike-CX83/cx83_webapp`, and there is no uncommitted owner work. A dirty or diverged checkout is left untouched and the healthy site stays up. Replacing the image does not by itself change `/repo`; `/repo` is a separate bind mount. The sync does not reset, delete, push, or contact GitHub. The server has no GitHub credential for this repository.

To return to the previous image by hand:

```bash
ssh -i ~/.ssh/vaultstorage-pilot root@157.245.247.90
docker tag cx83-webapp:staging-previous cx83-webapp:staging
docker compose --project-name cx83-webapp --project-directory /opt/cx83-webapp -f /opt/cx83-webapp/compose.yml up -d --no-deps --force-recreate --no-build --pull never web
```

## Server files that stay put

These values are already on the server. A normal image deploy does not rewrite them.

- `deploy/staging/compose.yml` is already at `/opt/cx83-webapp/compose.yml`. `deploy/staging/traefik.yaml` is already at `/data/coolify/proxy/dynamic/cx83-webapp.yaml`.
- `/opt/cx83-webapp/.env` stays filled from the local ignored `.env`, with these staging values:

- `DATABASE_URL` points at `cx83-webapp-postgres:5432/cx83_webapp_staging`. Use that container name. The hostname `postgres` on the Coolify network is Coolify's own database.
- `NEXT_PUBLIC_SERVER_URL=https://staging.cx83labs.com`
- `PAYLOAD_MCP_ENABLED=true`
- `CX83_REPO_ROOT=/repo`
- `PAYLOAD_DB_PUSH=false` after the database has been restored. Set it to `true` only to create the schema in an empty database that contains this app and nothing else.
- `AI_PROVIDER=openrouter` and the existing OpenRouter key and model.

DNS for `staging.cx83labs.com` is an unproxied A record to `157.245.247.90` in the Cloudflare zone `cx83labs.com`. Leave it DNS-only so Traefik's existing Let's Encrypt HTTP challenge can issue the certificate. Do not proxy this name through Cloudflare unless the origin certificate setup is changed on purpose.

The public site asks for the staging gate user `cx83` and the password in `staging-gate.pass`. Payload's existing owner account is unchanged. The database already has the website tables. Do not restore it as part of an image deploy.

The checkout at `/opt/cx83-webapp/repo` has its dependencies installed so repository checks can run the same commands as CI. One tunnel client is already running for tunnel `tunnel_6ac83333598c81919c842108753202e9`. The server profile points MCP at `http://cx83-webapp:3000/api/mcp` and injects the owner bearer with `extra_headers`. Do not start a second client for that tunnel.

## Backups

`deploy/staging/backup.sh` writes a database dump and a media archive to `/var/backups/cx83-webapp` and deletes files older than 14 days. The server cron entry is:

```text
15 4 * * * /opt/cx83-webapp/backup.sh >> /var/log/cx83-webapp-backup.log 2>&1
```

## Checkout tools for ChatGPT

The existing CX83 Website connection exposes two more owner tools. Do not add a second app, tunnel, or plugin.

`getRepositoryStatus` takes no arguments. It reports `checkoutSha`, `deployedSha`, `branch`, `dirty`, `syncNeeded`, `safeToSync`, `blocked`, `decision`, and `reason`. `blocked=true` means the checkout must not be moved. `decision=aligned` means it already matches the deployed commit. `decision=safe-to-sync` means a later sync can fast-forward. The tool does not fetch, merge, or print the remote URL.

`syncRepositoryCheckout` accepts an optional `expectedSha`. Leave it empty, or pass the deployed commit from `getRepositoryStatus`. Any other commit is refused. A safe call fast-forwards `/repo` and reports `decision=aligned`. Calling it again is a no-op. It refuses uncommitted and untracked owner files, a detached HEAD, a branch other than `staging-host`, a different GitHub repository, diverged history, a bundle that is not the recorded deployment, and a repository root other than `/repo`. Generated `.pnpm-store`, `node_modules`, `.next`, and `.cx83-checks` files do not count as owner work. The public visitor chat does not receive either tool.

ChatGPT keeps the tool list from the conversation that connected to the app. Start a new conversation with the existing CX83 Website app. If the new tools are absent, disconnect and reconnect that same app so ChatGPT requests the tool list again. Then call `getRepositoryStatus`. When `decision` is `aligned` or `safe-to-sync`, call `syncRepositoryCheckout`, then `readRepositoryFile` on `public/brand/logo-dark.svg` and `src/components/site/SiteHeader.tsx`.

## Repository checks

`runRepositoryCheck` starts `pnpm exec tsc --noEmit`, `pnpm lint`, or `pnpm test:int` in `/repo` and returns an id immediately. A second call with that id returns the exit code and output. Those commands are unchanged. An edit made by `applyRepositoryEdit` is written in `/opt/cx83-webapp/repo`. Commit and push that checkout, then let the existing GitHub Actions workflow validate it. Do not edit files inside the running image.

## Move this later

To place the same staging stack on another host, copy `/opt/cx83-webapp`, the Traefik file, and the cron entry. Point DNS at the new address, load the image, and start the compose project. Keep the tunnel profile with the containers so ChatGPT does not depend on a laptop.
