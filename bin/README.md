# Builder CLI Tools

**Scripts terminaux pour gestion BUILDER**

## Template Management

### rebuild-stack
**Rebuild template pré-built pour démarrage instantané**

```bash
rebuild-stack

# What it does:
# 1. Confirms with user
# 2. Cleans /opt/builder/template-ready
# 3. Copies .stack/
# 4. npm install
# 5. npm run build (Next.js production)
# 6. Creates metadata (.built-at)

# When to use:
# - After modifying .stack/package.json
# - After adding shadcn components
# - After changing Next.js config
# - First-time setup
```

### build-stack-template
**Low-level build script (called by rebuild-stack)**

```bash
build-stack-template

# Direct build without confirmation
# Used internally by rebuild-stack
# Can be called directly for automation
```

### check-template
**Check status du template pré-built**

```bash
check-template

# Shows:
# - Template exists?
# - Build date
# - Size
# - Contents (.next/, node_modules/, components/)
# - Component count
# - Ready status

# Example output:
# ✓ Pre-built template exists
# Built at: 2025-01-11 19:30:00 UTC
# Size: 450MB
# Status: Ready for instant project creation
```

## Project Management

### create-project-stream
**Create new project with SSE streaming (Dashboard API)**

```bash
create-project-stream my-project-name

# What it does:
# 1. Validates project name (kebab-case, 3-50 chars)
# 2. Checks if already exists
# 3. Clones pre-built template (instant)
# 4. Initializes .build/ structure
# 5. Assigns port via port-manager
# 6. Deploys to PM2
# 7. Health check (HTTP 200)
# 8. Returns SSE events (progress streaming)

# Called by: Dashboard API /api/projects/create
# Output: SSE event stream (JSON)
```

### port-manager
**Manage port assignments for projects**

```bash
# Assign next available port
port-manager assign my-project

# Release port
port-manager release 3001

# List all assignments
port-manager list

# Check if port available
port-manager check 3001
```

### list-projects
**List all Builder projects with status**

```bash
list-projects

# Shows table:
# Name | Path | Port | Status | Preview URL
# -----|------|------|--------|------------
# blog | /home/.../blog | 3001 | online | http://89...
```

### preview
**Get preview URL for project**

```bash
preview my-project

# Output:
# Project: my-project
# Port: 3001
# Status: online
# Preview: http://89.116.27.88:3001
```

### display-plan
**Display project plan (user-friendly format)**

```bash
display-plan "blog" \
  --feature "Articles avec auteur et date" \
  --feature "Système de commentaires" \
  --access "Blog public (pas de login)" \
  --data "PostgreSQL (Prisma)" \
  --design "Interface moderne + dark mode" \
  --stack "Next.js + PostgreSQL + shadcn/ui"

# Output:
# User-friendly plan with features, data, design
# Prompts: Continue? [y/n]
```

## Utility Scripts

### sudo-helper.sh
**Helper pour operations sudo (sourced by other scripts)**

```bash
# Not called directly, sourced:
source /home/pilote/projet/primaire/BUILDER/bin/sudo-helper.sh

# Provides:
# - safe_sudo() function
# - Permission checks
# - Error handling
```

## Installation & Setup

### First-Time Setup

```bash
# 1. Build template (required for instant project creation)
cd /home/pilote/projet/primaire/BUILDER
rebuild-stack

# 2. Verify template ready
check-template

# 3. Create test project
create-project-stream test-project

# Output:
# data: {"step":"clone","message":"Cloning optimized template...","status":"progress"}
# data: {"step":"clone","message":"Template cloned (0.5s)","status":"success"}
# ...
# data: {"step":"complete","message":"{...}","status":"complete"}
```

### Add to PATH (Optional)

```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="/home/pilote/projet/primaire/BUILDER/bin:$PATH"

# Reload shell
source ~/.bashrc

# Now can call from anywhere:
rebuild-stack
check-template
list-projects
```

## Workflow Integration

### Orchestrator → Scripts

**Nouveau projet:**
```
User: "Crée projet blog"
↓
Orchestrator: AskUserQuestion (features, auth, db)
↓
Orchestrator: display-plan (validation)
↓
Orchestrator: create-project-stream blog (SSE)
↓
Scripts: Clone template-ready → Deploy PM2
↓
Orchestrator: Update .build/
```

**Rebuild template:**
```
User modifie .stack/package.json
↓
User: rebuild-stack (manual)
↓
Scripts: Build .stack/ → /opt/builder/template-ready
↓
Nouveaux projets utilisent nouveau template
```

## Permissions

All scripts are executable:
```bash
chmod +x /home/pilote/projet/primaire/BUILDER/bin/*
```

Scripts requiring sudo:
- `build-stack-template` (writes to /opt/builder/)
- `port-manager` (writes to /var/builder/)

Use sudo-helper.sh for safe sudo operations.

## Troubleshooting

### Template Not Found

```bash
check-template
# Output: ⚠ Pre-built template not found

# Solution:
rebuild-stack
```

### Build Errors

```bash
# Test .stack/ manually
cd /home/pilote/projet/primaire/BUILDER/.stack
npm install
npm run build

# If works, rebuild:
rebuild-stack
```

### Port Conflicts

```bash
# List all ports
port-manager list

# Release stuck port
port-manager release 3001
```

### PM2 Issues

```bash
# Check PM2 status
pm2 list

# Restart project
pm2 restart my-project

# Logs
pm2 logs my-project
```

---

**All scripts maintained by Orchestrator**
**See `.build/template-optimization.md` for architecture details**
