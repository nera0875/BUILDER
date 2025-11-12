# MCP SSH Server

Model Context Protocol server with SSH backend for Claude.ai Connectors.

## Features

- ✅ **Streamable HTTP Transport** (MCP 2025-06-18 spec)
- 🔐 **Bearer Token Authentication** (OAuth-ready)
- 🖥️ **SSH Command Execution** on remote Linux servers
- 🛡️ **Command Whitelist/Blacklist** security
- 🐳 **Docker** containerized
- 🔒 **HTTPS** via Nginx reverse proxy

## Architecture

```
Claude.ai (web)
    ↓ HTTPS
Nginx Reverse Proxy (neurodopa.fr/mcp-ssh)
    ↓
MCP SSH Server (Docker :3000)
    ↓ SSH
Linux Server (89.116.27.88:22)
```

## Quick Start

### 1. Setup

```bash
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server

# Copy and configure environment
cp .env.example .env
nano .env  # Change BEARER_TOKEN!

# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 2. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/mcp-ssh

# Add config (see docs below)

# Enable and reload
sudo ln -s /etc/nginx/sites-available/mcp-ssh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Add to Claude.ai

Go to: **Settings → Connectors → Add Custom Connector**

```
Name: SSH VPS
URL: https://neurodopa.fr/mcp-ssh
```

**Advanced Settings → Headers:**
```
Authorization: Bearer mcp-ssh-secure-token-change-me-12345
```

## Nginx Configuration

```nginx
# /etc/nginx/sites-available/mcp-ssh

server {
    listen 443 ssl http2;
    server_name neurodopa.fr;

    # SSL certificates (Certbot managed)
    ssl_certificate /etc/letsencrypt/live/neurodopa.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neurodopa.fr/privkey.pem;

    # MCP SSH endpoint
    location /mcp-ssh/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;

        # SSE support
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `BEARER_TOKEN` | Auth token (CHANGE THIS!) | - |
| `DEFAULT_SSH_HOST` | SSH server | `89.116.27.88` |
| `DEFAULT_SSH_USER` | SSH username | `pilote` |
| `SSH_PRIVATE_KEY_PATH` | SSH key path | `/root/.ssh/id_rsa` |
| `ALLOWED_COMMANDS` | Command whitelist | See `.env` |
| `BLOCKED_COMMANDS` | Command blacklist | See `.env` |

## Tools Available

### `exec_ssh_command`

Execute shell commands via SSH.

**Parameters:**
- `command` (required): Shell command to execute
- `working_dir` (optional): Working directory
- `ssh_host` (optional): Override SSH host
- `ssh_port` (optional): Override SSH port
- `ssh_user` (optional): Override SSH username

**Example:**
```json
{
  "command": "ls -la /var/www",
  "working_dir": "/home/pilote"
}
```

## Security

- ✅ Bearer token authentication on ALL endpoints
- ✅ Command whitelist (only allowed commands execute)
- ✅ Command blacklist (dangerous commands blocked)
- ✅ SSH key-based authentication (no passwords)
- ✅ HTTPS enforced (no HTTP)
- ✅ Container isolation (Docker)

**⚠️ IMPORTANT:**
1. Change `BEARER_TOKEN` in `.env`
2. Configure strict `ALLOWED_COMMANDS`
3. Never expose port 3000 publicly (Nginx only)

## Development

```bash
# Install dependencies
npm install

# Dev mode (hot reload)
npm run dev

# Build
npm run build

# Test with MCP Inspector
npm run inspector
```

## Troubleshooting

### SSH Connection Failed

```bash
# Check SSH key permissions
ls -la /home/pilote/.ssh/id_rsa  # Should be 600

# Test SSH manually
ssh -i /home/pilote/.ssh/id_rsa pilote@89.116.27.88

# Check container SSH key
docker exec mcp-ssh-server ls -la /root/.ssh/
```

### 401 Unauthorized

- Verify `Authorization: Bearer <token>` header in Claude.ai
- Check token matches `.env` file
- Restart container: `docker-compose restart`

### 502 Bad Gateway

- Container not running: `docker-compose ps`
- Check logs: `docker-compose logs`
- Verify Nginx proxy_pass: `sudo nginx -t`

## Production Checklist

- [ ] Change `BEARER_TOKEN` to strong random value
- [ ] Configure strict `ALLOWED_COMMANDS` whitelist
- [ ] Setup SSL certificates (Certbot)
- [ ] Test SSH connection
- [ ] Monitor logs: `docker-compose logs -f`
- [ ] Setup log rotation
- [ ] Configure firewall (port 3000 closed)

## License

MIT
