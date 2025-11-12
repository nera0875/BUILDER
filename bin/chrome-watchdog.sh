#!/bin/bash

# Chrome VNC Watchdog - Keeps Chrome running in VNC display
# Restarts Chrome automatically if it's closed

DISPLAY_NUM=99
CDP_PORT=9222
CHECK_INTERVAL=10
DEFAULT_URL="http://89.116.27.88:9000/dashboard"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

is_chrome_running() {
    pgrep -f "google-chrome.*remote-debugging-port=${CDP_PORT}" >/dev/null
}

start_chrome() {
    log "Starting Chrome in VNC display :${DISPLAY_NUM}..."
    DISPLAY=:${DISPLAY_NUM} google-chrome \
        --remote-debugging-port=${CDP_PORT} \
        --remote-debugging-address=0.0.0.0 \
        --remote-allow-origins=* \
        --no-sandbox \
        --disable-gpu \
        --disable-dev-shm-usage \
        --user-data-dir=/tmp/chrome-mcp-shared \
        --window-size=1920,1080 \
        --start-maximized \
        "${DEFAULT_URL}" \
        >/dev/null 2>&1 &

    sleep 3

    if is_chrome_running; then
        log "✓ Chrome started successfully"
        return 0
    else
        log "✗ Failed to start Chrome"
        return 1
    fi
}

log "Chrome VNC Watchdog started"

while true; do
    if ! is_chrome_running; then
        log "⚠ Chrome not running, attempting restart..."
        start_chrome
    fi

    sleep ${CHECK_INTERVAL}
done
