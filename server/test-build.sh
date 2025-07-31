#!/bin/bash
set -e

echo "🧪 Testing build process locally..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build
echo "🏗️ Building..."
npm run build

# Check result
if [ -f "dist/main.js" ]; then
    echo "✅ Build test successful!"
    echo "📁 Build output:"
    ls -la dist/
    echo "🔍 Main.js size: $(wc -c < dist/main.js) bytes"
else
    echo "❌ Build test failed!"
    exit 1
fi