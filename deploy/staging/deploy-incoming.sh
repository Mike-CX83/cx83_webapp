#!/bin/sh
# Receives one gzipped image on stdin and replaces only the staging web container.
# Postgres data, media, environment files, backups, the MCP tunnel, and other
# containers stay as they are. The image that was running is kept as
# cx83-webapp:staging-previous.
set -eu

if [ "$(id -u)" -ne 0 ]; then
  exec sudo -n --preserve-env=SSH_ORIGINAL_COMMAND /opt/cx83-webapp/deploy-incoming.sh
fi

log() {
  printf '%s\n' "$1"
}

fail() {
  log "STAGING DEPLOY FAILURE"
  log "reason=$1"
  exit 1
}

compose_up_web() {
  docker compose \
    --project-name cx83-webapp \
    --project-directory /opt/cx83-webapp \
    -f /opt/cx83-webapp/compose.yml \
    up -d --no-deps --force-recreate --no-build --pull never web
}

rollback() {
  reason=$1
  log "STAGING DEPLOY FAILURE"
  log "reason=$reason"
  if docker image inspect cx83-webapp:staging-previous >/dev/null 2>&1; then
    failed_id=$(docker image inspect -f '{{.Id}}' cx83-webapp:staging 2>/dev/null || true)
    previous_id=$(docker image inspect -f '{{.Id}}' cx83-webapp:staging-previous)
    docker tag cx83-webapp:staging-previous cx83-webapp:staging
    compose_up_web
    if [ -n "$failed_id" ] && [ "$failed_id" != "$previous_id" ]; then
      docker rmi "$failed_id" >/dev/null 2>&1 || true
    fi
    log "rollback=restored-previous-image"
  else
    log "rollback=unavailable"
  fi
  exit 1
}

sync_checkout() {
  sync_log=$(mktemp)
  if ! docker exec -u nextjs cx83-webapp test -f /app/repositoryCheckout.ts; then
    log "checkout_sync=unavailable"
    rm -f "$sync_log"
    return 0
  fi
  if docker exec -u nextjs -e GIT_TERMINAL_PROMPT=0 cx83-webapp \
    node --disable-warning=ExperimentalWarning --experimental-strip-types /app/repositoryCheckout.ts --sync \
    >"$sync_log" 2>&1; then
    log "checkout_sync=ok"
  else
    log "checkout_sync=blocked"
  fi
  sed -E \
    -e 's#(https://)[^@[:space:]]+@#\1[redacted]@#g' \
    -e 's/Bearer[[:space:]]+[A-Za-z0-9._~+/-]+/Bearer [redacted]/g' \
    "$sync_log" | grep -E '^(decision|blocked|safeToSync|syncNeeded|dirty|branch|origin|checkoutSha|deployedSha|reason)=' || true
  rm -f "$sync_log"
  return 0
}

case "${SSH_ORIGINAL_COMMAND:-}" in
  deploy\ [0-9a-fA-F]*)
    sha=${SSH_ORIGINAL_COMMAND#deploy }
    ;;
  *)
    fail "rejected-command"
    ;;
esac

case "$sha" in
  *[!0-9a-fA-F]*)
    fail "rejected-command"
    ;;
esac

if [ "${#sha}" -lt 7 ] || [ "${#sha}" -gt 40 ]; then
  fail "rejected-command"
fi

mkdir -p /opt/cx83-webapp
touch /opt/cx83-webapp/deploy.lock
exec 9<>/opt/cx83-webapp/deploy.lock
if ! flock -n 9; then
  fail "deploy-already-running"
fi

avail_kb=$(df -Pk / | awk 'NR==2 {print $4}')
if [ "$avail_kb" -lt 8388608 ]; then
  fail "not-enough-disk"
fi

if [ "$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' cx83-webapp-postgres)" != "healthy" ]; then
  fail "postgres-not-healthy"
fi

if [ "$(docker inspect -f '{{.State.Running}}' cx83-webapp-tunnel)" != "true" ]; then
  fail "tunnel-not-running"
fi

snap=$(mktemp)
image_tar=$(mktemp /tmp/cx83-webapp-image.XXXXXX.tar)
payload=$(mktemp /tmp/cx83-webapp-payload.XXXXXX)
health=$(mktemp)
trap 'rm -f "$snap" "$image_tar" "$payload" "$health"' EXIT

docker ps --format '{{.Names}}' | while read -r name; do
  docker inspect -f '{{.Name}} {{.State.Status}} {{.State.StartedAt}}' "$name"
done > "$snap"

if ! cat > "$payload"; then
  fail "image-receive-failed"
fi

if gzip -t "$payload" 2>/dev/null; then
  if ! gzip -dc "$payload" > "$image_tar"; then
    fail "image-unpack-failed"
  fi
else
  mv "$payload" "$image_tar"
  payload=$(mktemp /tmp/cx83-webapp-payload.XXXXXX)
fi

if [ ! -s "$image_tar" ]; then
  fail "image-unpack-failed"
fi

old_previous_id=
if docker image inspect cx83-webapp:staging-previous >/dev/null 2>&1; then
  old_previous_id=$(docker image inspect -f '{{.Id}}' cx83-webapp:staging-previous)
fi

if docker image inspect cx83-webapp:staging >/dev/null 2>&1; then
  docker tag cx83-webapp:staging cx83-webapp:staging-previous
fi

if ! docker load -i "$image_tar"; then
  if docker image inspect cx83-webapp:staging-previous >/dev/null 2>&1; then
    docker tag cx83-webapp:staging-previous cx83-webapp:staging
  fi
  fail "image-load-failed"
fi

if ! docker image inspect cx83-webapp:staging >/dev/null 2>&1; then
  fail "staging-tag-missing"
fi

if ! compose_up_web; then
  rollback "web-recreate-failed"
fi

ready=0
i=0
while [ "$i" -lt 45 ]; do
  if [ "$(docker inspect -f '{{.State.Running}}' cx83-webapp 2>/dev/null || true)" = "true" ]; then
    if docker exec cx83-webapp node -e 'fetch("http://127.0.0.1:3000/").then(async (r)=>{const t=await r.text(); if(r.status!==200 || !t.includes("CX83 Labs")) process.exit(1); process.exit(0)}).catch(()=>process.exit(1))'; then
      ready=1
      break
    fi
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$ready" -ne 1 ]; then
  rollback "web-health-failed"
fi

running_image=$(docker inspect -f '{{.Image}}' cx83-webapp)
staging_image=$(docker image inspect -f '{{.Id}}' cx83-webapp:staging)
if [ "$running_image" != "$staging_image" ]; then
  rollback "web-image-mismatch"
fi

if ! python3 - "$health" << 'PY'
import pathlib, re, sys, urllib.error, urllib.request

out = pathlib.Path(sys.argv[1])
password = pathlib.Path("/opt/cx83-webapp/staging-gate.pass").read_text().strip()
base = "https://staging.cx83labs.com"

def fetch(path, auth):
    req = urllib.request.Request(base + path)
    if auth:
        token = __import__("base64").b64encode(f"cx83:{password}".encode()).decode()
        req.add_header("Authorization", f"Basic {token}")
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return res.status, res.read()
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read()

unauth, _ = fetch("/", False)
auth, body = fetch("/", True)
text = body.decode("utf-8", "replace")
banner = "present" if "cx83-labs-hero.avif" in text else "absent"
lines = [
    f"gate_without_password={unauth}",
    f"site_with_password={auth}",
    f"banner={banner}",
]
ok = unauth == 401 and auth == 200 and "CX83 Labs" in text
if banner == "present":
    static_status, _ = fetch("/brand/cx83-labs-hero.avif", True)
    match = re.search(r'(/_next/image\?[^"\s]+cx83-labs-hero\.avif[^"\s]*)', text)
    candidates = []
    if match:
        candidates.append(match.group(1).replace("&amp;", "&"))
    candidates.append("/_next/image?url=%2Fbrand%2Fcx83-labs-hero.avif&w=1080&q=100")
    image_status = "missing-url"
    for candidate in candidates:
        image_status, _ = fetch(candidate, True)
        if image_status == 200:
            break
    lines.append(f"static_image={static_status}")
    lines.append(f"optimized_image={image_status}")
    ok = ok and static_status == 200 and image_status == 200
out.write_text("\n".join(lines) + "\n")
sys.exit(0 if ok else 1)
PY
then
  cat "$health" || true
  rollback "public-health-failed"
fi

cat "$health"

changed=0
while read -r name status started; do
  short=${name#/}
  if [ "$short" = "cx83-webapp" ]; then
    continue
  fi
  now=$(docker inspect -f '{{.State.Status}} {{.State.StartedAt}}' "$short")
  if [ "$now" != "$status $started" ]; then
    log "changed=$short"
    changed=1
  fi
done < "$snap"

if [ "$changed" -ne 0 ]; then
  rollback "unrelated-container-changed"
fi

if ! docker image inspect cx83-webapp:staging-previous >/dev/null 2>&1; then
  rollback "previous-image-missing"
fi

if [ -n "$old_previous_id" ]; then
  kept_previous=$(docker image inspect -f '{{.Id}}' cx83-webapp:staging-previous)
  kept_staging=$(docker image inspect -f '{{.Id}}' cx83-webapp:staging)
  if [ "$old_previous_id" != "$kept_previous" ] && [ "$old_previous_id" != "$kept_staging" ]; then
    docker rmi "$old_previous_id" >/dev/null 2>&1 || true
  fi
fi

sync_checkout

log "STAGING DEPLOY SUCCESS"
log "sha=$sha"
log "previous_image=present"
