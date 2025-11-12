# MCP SSH Server - Instructions Finales

## ✅ CE QUI EST FAIT

1. **MCP SSH Server fonctionnel**
   - Container Docker UP: `mcp-ssh-server`
   - Port: 127.0.0.1:3000
   - Health check OK: http://127.0.0.1:3000/health

2. **Nginx configuré**
   - Config: `/etc/nginx/sites-available/mcp-ssh`
   - Subdomain: `mcp-ssh.neurodopa.fr`
   - SSL: Let's Encrypt

3. **Sécurité configurée**
   - Bearer token: Dans `.env`
   - Command whitelist/blacklist
   - SSH key auth

---

## ⚠️ ACTION REQUISE: DNS

**BLOCKER CRITIQUE pour Claude.ai:**

Ajoute un A record DNS:
```
mcp-ssh.neurodopa.fr → 89.116.27.88
```

**Où configurer:**
- Dashboard DNS de ton registrar (où neurodopa.fr est enregistré)
- OVH / Gandi / Cloudflare / etc.

**Propagation:** 5-30 minutes

**Vérifier:**
```bash
nslookup mcp-ssh.neurodopa.fr
# Doit retourner: 89.116.27.88
```

---

## 📋 APRÈS DNS: Configurer Claude.ai

### 1. Aller dans Claude.ai

```
https://claude.ai/settings/connectors
```

### 2. Add Custom Connector

**Nom:**
```
SSH VPS
```

**URL du serveur MCP distant:**
```
https://mcp-ssh.neurodopa.fr
```

**⚠️ PAS de trailing slash !**

### 3. Advanced Settings → Add Header

Cliquer "Advanced" puis "Add header"

**Header Name:**
```
Authorization
```

**Header Value:**
```
Bearer mcp-ssh-secure-token-change-me-12345
```

**⚠️ Remplace par le token dans `/home/pilote/projet/primaire/BUILDER/mcp-ssh-server/.env`**

### 4. Save

Claude.ai va tester la connexion.

Si DNS OK → ✅ Connector actif  
Si DNS KO → ❌ Connection failed

---

## 🧪 TESTER

### Test 1: Health (no auth)

```bash
curl https://mcp-ssh.neurodopa.fr/health
```

**Expected:**
```json
{"status":"ok","version":"1.0.0","protocol":"MCP/2025-06-18"}
```

### Test 2: Protocol Discovery (avec auth)

```bash
curl -I -H "Authorization: Bearer mcp-ssh-secure-token-change-me-12345" \
     https://mcp-ssh.neurodopa.fr/
```

**Expected:**
```
HTTP/2 200
mcp-protocol-version: 2025-06-18
```

### Test 3: Via Claude.ai

Dans Claude.ai, demande:

```
Execute command: ls -la /home/pilote
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

## 🔐 SÉCURITÉ

### Changer le Bearer Token (OBLIGATOIRE avant production)

```bash
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server

# Generate token
openssl rand -hex 32

# Update .env
nano .env
# BEARER_TOKEN=<nouveau-token-généré>

# Restart
docker restart mcp-ssh-server

# Update token dans Claude.ai Settings
```

### Whitelist Commands

```bash
# Edit .env
ALLOWED_COMMANDS=ls,cat,grep,find,ps,df,pm2 list,systemctl status,git status,docker ps

# Commands hors liste = bloquées
```

---

## 🔧 MAINTENANCE

### Start/Stop

```bash
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server

# Start
./start.sh

# Stop
docker stop mcp-ssh-server

# Restart
docker restart mcp-ssh-server

# Logs
docker logs -f mcp-ssh-server
```

### Update Code

```bash
cd /home/pilote/projet/primaire/BUILDER/mcp-ssh-server

# Edit files
nano src/index.ts

# Rebuild
docker build -t mcp-ssh-server:latest .

# Restart
./start.sh
```

---

## 📚 DOCUMENTATION

- **README.md**: Overview complet
- **SETUP.md**: Guide setup détaillé
- **INSTRUCTIONS.md**: Ce fichier (quick start)

---

## 🆘 TROUBLESHOOTING

### Container not starting

```bash
docker logs mcp-ssh-server
```

### SSH failed

```bash
# Test manuel
ssh -i /home/pilote/.ssh/id_rsa pilote@89.116.27.88

# Check key
ls -la /home/pilote/.ssh/id_rsa  # Must be 600
```

### 401 Unauthorized

Token mismatch `.env` vs Claude.ai header

### 502 Bad Gateway

Container stopped ou Nginx config error

---

**TL;DR:**

1. ✅ Server UP (container running)
2. ⚠️ **Ajoute DNS: `mcp-ssh.neurodopa.fr → 89.116.27.88`**
3. ⚠️ **Configure Claude.ai avec URL + Bearer token**
4. ✅ Test commandes SSH via Claude.ai

**Next:** Attends propagation DNS (~15min) puis teste.
