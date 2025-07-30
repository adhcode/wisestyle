#!/bin/bash

echo "🔧 Fixing server build issues..."

# Clean dist folder
echo "📁 Cleaning dist folder..."
rm -rf dist

# Clean Prisma generated files
echo "🗑️ Cleaning Prisma generated files..."
rm -rf node_modules/.prisma
rm -rf prisma/generated

# Clean node_modules if needed
echo "📦 Checking dependencies..."
if [ "$1" = "--clean" ]; then
    echo "🧹 Full clean - removing node_modules..."
    rm -rf node_modules
    npm install
fi

# Generate Prisma client
echo "🔄 Regenerating Prisma client..."
npx prisma generate

# Verify Prisma client generation
echo "✅ Verifying Prisma client..."
if [ ! -d "node_modules/.prisma" ]; then
    echo "❌ Prisma client generation failed!"
    exit 1
fi

# Build the project
echo "🏗️ Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build fix complete!"
else
    echo "❌ Build failed. Try running with --clean flag for full cleanup."
    exit 1
fi