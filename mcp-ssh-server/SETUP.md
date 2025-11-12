# MCP SSH Server - Setup Guide

Guide complet pour connecter Claude.ai à votre VPS via SSH.

## 🎯 Objectif

Permettre à Claude.ai (web) d'exécuter des commandes SSH sur votre VPS `89.116.27.88`.

## 📋 Prérequis

- [x] VPS accessible via SSH (89.116.27.88)
- [x] Domaine HTTPS (neurodopa.fr)
- [x] Certificat SSL (Let's Encrypt)
- [x] Docker installé
- [x] Nginx installé

## 🚀 Installation Rapide

### 1. Build & Start

```bash
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server

# Build Docker image
docker build -t mcp-ssh-server:latest .

# Start server
./start.sh

# Vérifier logs
docker logs -f mcp-ssh-server
```

### 2. Tester Endpoint

```bash
# Health check (no auth)
curl https://neurodopa.fr/mcp-ssh/health

# Test auth
curl -H "Authorization: Bearer mcp-ssh-secure-token-change-me-12345" \
     -X HEAD \
     https://neurodopa.fr/mcp-ssh/

# Devrait retourner header: MCP-Protocol-Version: 2025-06-18
```

### 3. Configurer Claude.ai

#### A. Aller dans Claude.ai Settings

```
https://claude.ai/settings/connectors
```

#### B. Add Custom Connector

**Nom:**
```
SSH VPS (neurodopa.fr)
```

**URL du serveur MCP distant:**
```
https://neurodopa.fr/mcp-ssh
```

**⚠️ IMPORTANT: PAS de trailing slash !**

#### C. Advanced Settings → Add Header

**Header Name:**
```
Authorization
```

**Header Value:**
```
Bearer mcp-ssh-secure-token-change-me-12345
```

**⚠️ Remplace le token par celui dans ton `.env` !**

#### D. Save

Claude.ai va tester la connexion. Si ça marche, le connector apparaîtra actif ✅

---

## 🔐 Sécurité

### Changer le Bearer Token

```bash
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server

# Edit .env
nano .env

# Change cette ligne:
BEARER_TOKEN=ton-nouveau-token-ultra-securise-ici

# Restart container
docker restart mcp-ssh-server
```

### Whitelist Commands

```bash
# Edit .env
ALLOWED_COMMANDS=ls,cat,grep,find,ps,df,pm2 list,systemctl status

# Commands non listées seront bloquées
```

### Blacklist Dangerous Commands

```bash
# Edit .env
BLOCKED_COMMANDS=rm -rf,shutdown,reboot,mkfs,dd,chmod 777,passwd

# Ces patterns seront toujours bloqués
```

---

## 🧪 Tests

### Test 1: Health Check

```bash
curl https://neurodopa.fr/mcp-ssh/health
```

**Expected:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "protocol": "MCP/2025-06-18"
}
```

### Test 2: Protocol Discovery

```bash
curl -I -H "Authorization: Bearer YOUR_TOKEN" \
     https://neurodopa.fr/mcp-ssh/
```

**Expected:**
```
HTTP/2 200
mcp-protocol-version: 2025-06-18
```

### Test 3: SSH Command

Via Claude.ai, demande:

```
Execute: ls -la /home/pilote
```

**Expected:**
```
📡 SSH Command Executed

🔧 Command: ls -la /home/pilote
📂 Working Dir: (default)
🖥️  Host: 89.116.27.88:22

✅ Exit Code: 0

📤 STDOUT:
total 100
drwxr-x--- 36 pilote pilote 4096 Nov 12 19:58 .
...

✅ Success
```

---

## 🔧 Troubleshooting

### Error: 401 Unauthorized

**Cause:** Bearer token invalide

**Fix:**
```bash
# 1. Vérifier token dans .env
cat /home/pilote/projet/primaire/BUILDER/mcp-ssh-server/.env | grep BEARER_TOKEN

# 2. Update header dans Claude.ai Settings
Authorization: Bearer <token-from-env>

# 3. Restart container
docker restart mcp-ssh-server
```

### Error: 502 Bad Gateway

**Cause:** Container pas démarré

**Fix:**
```bash
# Check container status
docker ps | grep mcp-ssh-server

# Si absent:
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server
./start.sh

# Check logs
docker logs mcp-ssh-server
```

### Error: SSH Connection Failed

**Cause:** Clé SSH invalide ou user incorrect

**Fix:**
```bash
# 1. Test SSH manuel
ssh -i /home/pilote/.ssh/id_rsa pilote@89.116.27.88

# 2. Check key permissions
ls -la /home/pilote/.ssh/id_rsa
# Doit être: -rw------- (600)

# 3. Fix permissions si nécessaire
chmod 600 /home/pilote/.ssh/id_rsa

# 4. Restart container
docker restart mcp-ssh-server
```

### Error: Command Blocked

**Cause:** Command pas dans whitelist

**Fix:**
```bash
# Edit .env
nano /home/pilote/projet/primaire/BUILDER/mcp-ssh-server/.env

# Ajoute command à ALLOWED_COMMANDS
ALLOWED_COMMANDS=ls,cat,grep,find,ps,df,ta-nouvelle-command

# Restart
docker restart mcp-ssh-server
```

---

## 📊 Monitoring

### Logs Live

```bash
docker logs -f mcp-ssh-server
```

### Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/mcp-ssh-access.log

# Error log
sudo tail -f /var/log/nginx/mcp-ssh-error.log
```

### Container Stats

```bash
docker stats mcp-ssh-server
```

---

## 🔄 Updates

### Pull Latest Code

```bash
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server
git pull

# Rebuild
docker build -t mcp-ssh-server:latest .

# Restart
./start.sh
```

---

## 🛑 Stop/Remove

### Stop Container

```bash
docker stop mcp-ssh-server
```

### Remove Container

```bash
docker rm mcp-ssh-server
```

### Remove Image

```bash
docker rmi mcp-ssh-server:latest
```

### Remove Nginx Config

```bash
sudo rm /etc/nginx/sites-enabled/mcp-ssh
sudo rm /etc/nginx/sites-available/mcp-ssh
sudo systemctl reload nginx
```

---

## 📚 Resources

- MCP Spec: https://modelcontextprotocol.io/specification/draft
- Claude Connectors: https://support.claude.com/en/articles/11724452
- Node.js SSH2: https://github.com/mscdex/ssh2

---

## ✅ Checklist Production

- [ ] Bearer token changé (pas le default)
- [ ] ALLOWED_COMMANDS configuré (whitelist)
- [ ] BLOCKED_COMMANDS configuré (blacklist)
- [ ] SSH key permissions = 600
- [ ] Container auto-restart activé
- [ ] Nginx logs rotatés
- [ ] Firewall: port 3000 fermé (Nginx only)
- [ ] Monitoring activé
- [ ] Backups .env configurés

---

**Version:** 1.0.0
**Date:** 2025-11-12
**Author:** Builder System
