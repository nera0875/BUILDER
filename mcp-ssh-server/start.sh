#!/bin/bash
# Start MCP SSH Server with Docker

set -e

cd "$(dirname "$0")"

# Check if container exists and remove
if docker ps -a --format '{{.Names}}' | grep -q '^mcp-ssh-server$'; then
    echo "🗑️  Removing existing container..."
    docker rm -f mcp-ssh-server
fi

# Start container
echo "🚀 Starting MCP SSH Server..."
docker run -d \
    --name mcp-ssh-server \
    --restart unless-stopped \
    -p 127.0.0.1:3000:3000 \
    -v /home/pilote/.ssh/id_rsa:/root/.ssh/id_rsa:ro \
    --env-file .env \
    mcp-ssh-server:latest

echo "✅ Container started"
echo ""
echo "📋 Status:"
docker ps --filter name=mcp-ssh-server --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📝 Logs (Ctrl+C to exit):"
docker logs -f mcp-ssh-server
