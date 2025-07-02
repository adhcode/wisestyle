#!/bin/sh
set -e

echo "Current user: $(whoami)"
echo "Working dir: $(pwd)"
ls -al

echo "Testing Node.js..."
node --version
echo "Testing if dist/main exists..."
ls -la dist/
echo "Checking dist/main..."
file dist/main.js 2>/dev/null || echo "main.js not found"

echo "Starting application..."
if [ -f "dist/main.js" ]; then
  echo "Found dist/main.js, starting..."
  exec node dist/main.js
elif [ -f "dist/main" ]; then
  echo "Found dist/main, starting..."
  exec node dist/main
else
  echo "ERROR: Neither dist/main nor dist/main.js found!"
  ls -la dist/
  exit 1
fi 