#!/usr/bin/env bash
# Derive a SQLite schema from the Postgres source of truth, then push + seed it.
# Keeps local dev zero-setup without maintaining a second schema by hand.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=prisma/schema.prisma
OUT=prisma/.schema.local.prisma

sed 's/provider = "postgresql"/provider = "sqlite"/' "$SRC" > "$OUT"

export DATABASE_URL="file:./dev.db"
npx prisma db push --schema="$OUT" --skip-generate
npx prisma generate --schema="$OUT"
npx tsx prisma/seed.ts
echo "✓ local SQLite database ready (prisma/dev.db)"
