#!/bin/sh
# Daily backup of the staging database and media. Run on the server as root.
set -eu

backup_dir=/var/backups/cx83-webapp
stamp=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$backup_dir"

docker exec cx83-webapp-postgres pg_dump -U cx83 --no-owner --no-privileges cx83_webapp_staging \
  | gzip -c > "$backup_dir/db-$stamp.sql.gz"

tar -C /opt/cx83-webapp -czf "$backup_dir/media-$stamp.tar.gz" media

find "$backup_dir" -type f -mtime +14 -delete
echo "Wrote $backup_dir/db-$stamp.sql.gz and media-$stamp.tar.gz"
