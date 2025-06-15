#!/bin/bash

echo "🚀 Deploying Go API..."

# Build the application
echo "📦 Building application..."
go build -o api-server ./main.go

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Starting server on port 8080..."
    echo "📡 API endpoints available:"
    echo "   - http://localhost:8080/hello"
    echo "   - http://localhost:8080/test"
    echo "   - http://localhost:8080/foo"
    echo "   - http://localhost:8080/metrics"
    echo ""
    echo "Press Ctrl+C to stop the server"
    
    # Run the server
    ./api-server serve
else
    echo "❌ Build failed!"
    exit 1
fi 