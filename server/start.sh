#!/bin/sh
set -e

echo "Current user: $(whoami)"
echo "Working dir: $(pwd)"
ls -al

echo "Running database migrations..."
npx prisma migrate deploy

# Optionally seed database on first deploy
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed
fi

echo "Starting application..."
exec npm run start:prod 