#!/usr/bin/env sh
set -eu

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-murmur}"
DB_PASSWORD="${DB_PASSWORD:-${POSTGRES_PASSWORD:-}}"
DB_NAME="${DB_NAME:-murmur_db}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/database/migrations}"

if [ -z "${DB_PASSWORD}" ]; then
  echo "DB_PASSWORD/POSTGRES_PASSWORD is required" >&2
  exit 1
fi

export PGPASSWORD="${DB_PASSWORD}"

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
for i in $(seq 1 60); do
  if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "select 1" >/dev/null 2>&1; then
    echo "Postgres is up."
    break
  fi
  sleep 1
done

echo "Applying migrations from ${MIGRATIONS_DIR}..."
# Ensure directory exists even if empty
if [ ! -d "${MIGRATIONS_DIR}" ]; then
  echo "Migrations dir not found: ${MIGRATIONS_DIR}" >&2
  exit 1
fi

# Apply in filename order
for f in $(ls -1 "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort); do
  echo "Running: ${f}"
  psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 -f "${f}"
done

echo "Migrations complete."
