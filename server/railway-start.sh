#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if main.js exists
if [ ! -f "dist/main.js" ]; then
    echo "❌ dist/main.js not found! Build may have failed."
    echo "Contents of current directory:"
    ls -la
    echo "Contents of dist directory (if exists):"
    ls -la dist/ || echo "dist directory doesn't exist"
    exit 1
fi

echo "✅ dist/main.js found"

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL not set"
else
    echo "✅ DATABASE_URL is set"
fi

if [ -z "$PORT" ]; then
    echo "⚠️ PORT not set, using default 3001"
    export PORT=3001
else
    echo "✅ PORT is set to $PORT"
fi

# Run database migrations with error handling
echo "🗄️ Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
else
    echo "⚠️ Database migrations failed or skipped"
    # Don't exit here as the app might still work
fi

# Start the application with explicit error handling
echo "🚀 Starting application..."
echo "Command: node dist/main.js"

# Add some delay to ensure everything is ready
sleep 2

exec node dist/main.js