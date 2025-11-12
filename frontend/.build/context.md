# Project Context

## Stack Technique
- Frontend: Next.js 16 + shadcn/ui (57 components)
- Styling: Tailwind CSS v4
- Dark mode: Included (themes.css)

## Architecture Actuelle

### API Routes
**Health Monitoring:**
- `/api/health/system` - CPU, RAM, Disk, Uptime
- `/api/health/nginx` - Nginx status
- `/api/health/pm2` - PM2 processes
- `/api/health/processes` - System processes
- `/api/health/ports` - TCP/UDP listening ports (NEW)
- `/api/health/docker` - Docker containers status (NEW)
- `/api/health/systemd` - Systemd services (nginx, postgresql, docker, pm2) (NEW)
- `/api/health/network` - Active network connections (NEW)

**Project Management:**
- `/api/projects/create` - Create new project
- `/api/projects/list` - List all projects
- `/api/projects/create-stream` - Stream project creation
- `/api/projects/[name]/delete` - Delete project
- `/api/projects/[name]/start` - Start project
- `/api/projects/[name]/stop` - Stop project
- `/api/projects/[name]/restart` - Restart project
- `/api/projects/[name]/logs` - Project logs
- `/api/projects/[name]/status` - Project status
- `/api/projects/[name]/change-port` - Change project port

## Conventions Établies
- Components: components/ui/ (shadcn)
- Pages: app/
- Utils: lib/utils.ts
