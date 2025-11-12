#!/usr/bin/env python3
"""
Chrome CDP Navigation Script
Navigate Chrome using Chrome DevTools Protocol
"""

import json
import websocket
import sys
import time

def navigate_chrome(url):
    """Navigate Chrome to a specific URL using CDP"""

    # Get the WebSocket endpoint
    import urllib.request
    with urllib.request.urlopen('http://localhost:9222/json/version') as response:
        version_info = json.loads(response.read())

    ws_url = version_info['webSocketDebuggerUrl']
    print(f"Connecting to: {ws_url}")

    # Connect to Chrome via WebSocket
    ws = websocket.create_connection(ws_url)

    # Get the first tab
    with urllib.request.urlopen('http://localhost:9222/json') as response:
        tabs = json.loads(response.read())

    if not tabs:
        print("No tabs found!")
        return

    target_id = tabs[0]['id']
    print(f"Using tab: {tabs[0].get('title', 'Unknown')}")

    # Attach to target
    attach_msg = {
        "id": 1,
        "method": "Target.attachToTarget",
        "params": {
            "targetId": target_id,
            "flatten": True
        }
    }
    ws.send(json.dumps(attach_msg))
    response = json.loads(ws.recv())
    session_id = response['result']['sessionId']

    # Navigate to URL
    navigate_msg = {
        "id": 2,
        "method": "Page.navigate",
        "params": {
            "url": url
        },
        "sessionId": session_id
    }
    ws.send(json.dumps(navigate_msg))
    response = json.loads(ws.recv())

    print(f"✓ Navigated to: {url}")

    # Wait a bit for page to load
    time.sleep(2)

    # Get page title
    title_msg = {
        "id": 3,
        "method": "Runtime.evaluate",
        "params": {
            "expression": "document.title"
        },
        "sessionId": session_id
    }
    ws.send(json.dumps(title_msg))
    response = json.loads(ws.recv())

    if 'result' in response and 'result' in response['result']:
        title = response['result']['result'].get('value', 'Unknown')
        print(f"Page title: {title}")

    ws.close()

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://www.google.com"
    navigate_chrome(url)