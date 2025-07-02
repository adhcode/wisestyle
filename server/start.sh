#!/bin/sh
set -e

echo "Current user: $(whoami)"
echo "Working dir: $(pwd)"
ls -al

echo "Testing Node.js..."
node --version

echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration step skipped or failed"

# Seed only when SEED_DB=true and only once
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed && echo "Seed completed" || echo "Seed failed"
fi

echo "Starting application..."
if [ -f "dist/main.js" ]; then
  exec node dist/main.js
else
  exec node dist/main
fi 