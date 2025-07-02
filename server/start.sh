#!/bin/sh
set -e

echo "Current user: $(whoami)"
echo "Working dir: $(pwd)"
ls -al

echo "Starting application..."
exec node dist/main 