# BUILDER Terminal Commands

Quick reference for rapid project creation and management.

---

## 🚀 Installation

Commands are automatically available after sourcing bashrc:

```bash
source ~/.bashrc
```

Or start a new terminal session.

---

## 📋 Available Commands

### 1. `new-project [name]`

**Create a new project in seconds**

```bash
new-project my-dashboard
```

**What it does:**
- ✅ Creates `projet/secondaire/my-dashboard/`
- ✅ Clones BUILDER stack (57 shadcn components + Next.js 16)
- ✅ Initializes `.build/` structure (context, timeline, tasks, issues, specs)
- ✅ Runs `npm install` automatically
- ✅ Ready for feature development

**Naming rules:**
- Must be kebab-case (lowercase, hyphens only)
- Examples: `task-timer`, `admin-dashboard`, `e-commerce`

**After creation:**
```bash
cd projet/secondaire/my-dashboard
# Tell Claude: "crée dashboard avec stats, charts, tables"
# Claude builds + deploys automatically
```

---

### 2. `preview [name]`

**Check project status and preview URL**

```bash
preview my-dashboard
```

**Output if online:**
```
✅ Project already running

🔗 Preview URL: http://89.116.27.88:3001

📊 PM2 Status:
[Full PM2 details...]

📝 Logs:
   pm2 logs my-dashboard
   pm2 logs my-dashboard --lines 50

🔄 Restart:
   pm2 restart my-dashboard
```

**Output if not deployed:**
```
⚠️  Project not deployed yet

🎯 To deploy and create preview:
   Tell Claude: 'deploy my-dashboard'
```

**From project directory:**
```bash
cd projet/secondaire/my-dashboard
preview  # Auto-detects project name
```

---

### 3. `list-projects`

**List all projects with status**

```bash
list-projects
```

**Output:**
```
📋 BUILDER Projects

┌────────────────────┬──────────┬────────────────────────────────────┐
│ Project            │ Status   │ Preview URL                        │
├────────────────────┼──────────┼────────────────────────────────────┤
│ admin-kanban       │ 🟢 online │ http://89.116.27.88:3001           │
│ task-timer         │ 🟡 stopped│ http://89.116.27.88:3002 (stopped) │
│ ecommerce          │ ⚪ not deployed │ (run: preview ecommerce)  │
└────────────────────┴──────────┴────────────────────────────────────┘

🔗 Commands:
   new-project [name]    - Create new project
   preview [name]        - Check preview status
   pm2 logs [name]       - View logs
   pm2 restart [name]    - Restart project
```

**Status Legend:**
- 🟢 **online** - Running and accessible
- 🟡 **stopped** - Deployed but PM2 stopped
- 🔴 **error** - PM2 process not found (needs redeploy)
- ⚪ **not deployed** - Not deployed yet

---

## 🔄 Typical Workflow

### Create New Project
```bash
# Step 1: Create project structure
new-project booking-system

# Step 2: Navigate to project
cd projet/secondaire/booking-system

# Step 3: Tell Claude what to build
# You: "crée système réservation avec calendrier, users, admin dashboard"
# Claude: Builds frontend + backend + database + tests + deploys
# Claude: "✅ Projet booking-system déployé
#          Preview: http://89.116.27.88:3003"

# Step 4: Check status anytime
preview booking-system
```

### Manage Existing Projects
```bash
# List all projects
list-projects

# Check specific project
preview admin-kanban

# View logs
pm2 logs admin-kanban

# Restart if needed
pm2 restart admin-kanban

# Stop project
pm2 stop admin-kanban

# Delete project (careful!)
pm2 delete admin-kanban
```

---

## 🎯 Integration with Claude

### Terminal-Based Workflow

```bash
# You control via terminal
new-project crm-app

# Claude sees request, builds project
# You: "crée CRM avec contacts, deals, pipeline"

# Claude automatically:
# 1. Clones .stack/
# 2. Creates components
# 3. Sets up database (if needed)
# 4. Runs tests
# 5. Deploys to PM2
# 6. Returns preview URL

# Check result
preview crm-app
# → http://89.116.27.88:3004
```

### Multiple Projects

```bash
# Session 1: Project A
cd projet/secondaire/admin-dashboard
# Tell Claude: work on admin-dashboard features

# Session 2: Project B (new terminal)
cd projet/secondaire/ecommerce
# Tell Claude: work on ecommerce features

# Both projects running simultaneously
list-projects
# → admin-dashboard (3001) 🟢 online
# → ecommerce (3002) 🟢 online
```

---

## 📂 Directory Structure

After `new-project my-app`:

```
projet/secondaire/my-app/
├── .build/
│   ├── context.md      # Current state (stack, architecture, conventions)
│   ├── timeline.md     # Append-only log (all changes)
│   ├── tasks.md        # Dynamic board (in progress, blocked, next up)
│   ├── issues.md       # Knowledge base (bugs, solutions)
│   ├── specs.md        # Planning document (vision, roadmap, ADRs)
│   └── decisions/      # Architecture Decision Records (ADRs)
├── .stack/             # Cloned from BUILDER
│   ├── components/ui/  # 57 shadcn components
│   ├── app/            # Next.js app directory
│   ├── lib/            # Utils (cn, etc)
│   └── configs/        # tsconfig, next.config, etc
├── package.json
├── .env                # PORT=3001 (auto-assigned on deploy)
└── (other Next.js files)
```

---

## 🔧 Troubleshooting

### Command not found
```bash
# Reload bashrc
source ~/.bashrc

# Or check PATH
echo $PATH | grep BUILDER
# Should contain: /home/pilote/projet/primaire/BUILDER/bin
```

### PM2 status shows "error"
```bash
# Redeploy project
cd projet/secondaire/my-app
# Tell Claude: "deploy my-app"
```

### Port conflicts
- Ports auto-increment (3001, 3002, 3003...)
- Stored in `.env` (persistent)
- Check with: `preview [name]` or `list-projects`

### Project not showing in list
```bash
# Verify directory exists
ls projet/secondaire/

# Check if .env exists (means deployed)
ls projet/secondaire/my-app/.env
```

---

## 💡 Tips

1. **Always use terminal commands** - Faster than asking Claude to create structure
2. **Check status before asking Claude** - `preview` shows if running/stopped
3. **Use list-projects regularly** - See all projects at a glance
4. **Port is stable** - Same preview URL forever (stored in .env)
5. **PM2 persists** - Projects survive server reboot (PM2 startup script)

---

## 🔗 Related Documentation

- **CLAUDE.md** - Full orchestrator instructions
- **deployment/SKILL.md** - Deployment workflow details
- **frontend/SKILL.md** - Frontend conventions
- **.build/specs.md** - Project planning template

---

**Version**: 1.0.0
**Last updated**: 2025-11-11
**Author**: BUILDER System
