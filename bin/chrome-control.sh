#!/bin/bash

# Simple Chrome Control via CDP

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get the first tab ID
TAB_ID=$(curl -s http://localhost:9222/json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TAB_ID" ]; then
    echo -e "${YELLOW}Creating new tab...${NC}"
    # Create a new tab
    curl -s -X PUT http://localhost:9222/json/new
    TAB_ID=$(curl -s http://localhost:9222/json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

echo -e "${BLUE}Using tab ID: $TAB_ID${NC}"

# Navigate to URL
URL="${1:-https://www.example.com}"
echo -e "${GREEN}Navigating to: $URL${NC}"

# Use CDP HTTP endpoint to navigate
curl -s -X POST "http://localhost:9222/json/runtime/evaluate" \
    -H "Content-Type: application/json" \
    -d "{
        \"expression\": \"window.location.href = '$URL'\"
    }" > /dev/null 2>&1

# Alternative method using WebSocket (requires wscat or similar)
# This is more reliable but needs additional tools

echo -e "${GREEN}✓ Navigation command sent!${NC}"
echo ""
echo "Check the Chrome window in NoVNC at:"
echo "http://89.116.27.88:6081/vnc.html"
echo ""
echo "Current tabs:"
curl -s http://localhost:9222/json | grep -o '"url":"[^"]*"' | cut -d'"' -f4