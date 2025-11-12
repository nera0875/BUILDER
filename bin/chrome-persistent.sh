#!/bin/bash

# Chrome Persistent Process for PM2
# Runs Chrome with auto-restart capability

DISPLAY=:99 google-chrome \
    --remote-debugging-port=9222 \
    --remote-debugging-address=0.0.0.0 \
    --remote-allow-origins=* \
    --no-sandbox \
    --disable-gpu \
    --disable-dev-shm-usage \
    --user-data-dir=/tmp/chrome-mcp-shared \
    --window-size=1920,1080 \
    --start-maximized \
    http://89.116.27.88:9000/dashboard
