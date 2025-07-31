#!/bin/bash

echo "🏥 Testing health endpoint..."

# Start the server in background
npm run start:prod &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -f http://localhost:3001/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
fi

# Kill the server
kill $SERVER_PID

echo "🏁 Test completed"