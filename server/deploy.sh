#!/bin/bash
set -e

echo "🚀 Starting deployment process..."
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# List current files
echo "📁 Current directory contents:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -f "dist/main.js" ]; then
    echo "✅ Build successful - main.js found"
    ls -la dist/
else
    echo "❌ Build failed - main.js not found"
    echo "Contents of dist directory:"
    ls -la dist/ || echo "dist directory doesn't exist"
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || echo "⚠️ Migration step skipped or failed"

# Start the application
echo "🚀 Starting application..."
exec node dist/main.js