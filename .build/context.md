# Project Context - BUILDER Dashboard

> **Living Document** - Updated by EXECUTOR after each feature
>
> Last updated: 2025-01-12

---

## Stack Technique

### Frontend
- Framework: **Next.js 16** (App Router)
- UI Library: **shadcn/ui** (57 components)
- Styling: **Tailwind CSS**
- State: React Server Components + Client Components
- Drag & Drop: **@dnd-kit**

### Backend
- Platform: **Node.js**
- Database: **PostgreSQL** (port 5434)
- ORM: *(pas encore utilisé - à définir si besoin)*
- Process Manager: **PM2**

### DevOps
- Deployment: **PM2** (local VPS)
- Monitoring: Diagnostics dashboard (ports, systemd, PM2)

---

## Architecture Actuelle

### Structure Fichiers

```
frontend/
├── app/
│   ├── layout.tsx (root layout)
│   └── dashboard/
│       └── page.tsx (main dashboard)
├── components/
│   ├── ui/ (shadcn 57 composants READ-ONLY)
│   ├── sidebar-nav.tsx
│   ├── project-console.tsx
│   ├── pm2-process-list.tsx
│   ├── diagnostics-*.tsx (4 composants)
│   └── project-*.tsx (3 composants)
└── lib/
    └── utils.ts (cn helper)
```

### Routes/Pages

**Existantes:**
- `/` → Dashboard principal (project list + sidebar)
- `/dashboard` → Même que `/`

**Sidebar Navigation:**
- Dashboard (active)
- Project Console (logs streaming SSE)
- Diagnostics (ports, systemd, PM2, VNC)

### Composants Clés

**Dashboard:**
- `sidebar-nav.tsx` - Navigation sidebar principale
- `pm2-process-list.tsx` - Liste projets PM2
- `project-console.tsx` - SSE logs streaming
- `project-actions.tsx` - Actions projet (stop/restart)
- `new-project-dialog.tsx` - Création projet

**Diagnostics:**
- `diagnostics-overview.tsx` - Vue d'ensemble système
- `diagnostics-tabs.tsx` - Tabs diagnostics
- `diagnostics-ports.tsx` - Scan ports TCP/UDP
- `systemd-services.tsx` - Services Linux
- `vnc-viewer.tsx` - VNC remote display

**shadcn/ui (57 composants READ-ONLY):**
- dialog, sheet, tabs, card, button, input, etc.

---

## Conventions Établies

### Frontend
- **Imports:** `@/components/*`, `@/lib/*`
- **Client Components:** `"use client"` directive (drag-drop, SSE, interactions)
- **Server Components:** Default (data fetching)
- **Styling:** Tailwind utilities uniquement
- **UI Base:** shadcn/ui (JAMAIS modifier components/ui/)

### Routes API
- `/api/projects` - CRUD projets PM2
- `/api/logs/[project]` - SSE streaming logs
- `/api/health/*` - Endpoints diagnostics (ports, docker, systemd)

### Data Fetching
- Server Actions: *(pas encore utilisé)*
- API Routes: Fetch côté client

---

## Dépendances Importantes

**Core:**
- next@16.x
- react@19.x
- tailwindcss@4.x

**UI:**
- @radix-ui/* (38 packages - shadcn base)
- @dnd-kit/* (drag & drop)
- lucide-react (icons)

**Utilities:**
- clsx, tailwind-merge (cn helper)
- class-variance-authority (variants)
- zod (validation - installé mais pas utilisé)

---

## État Projet

- **Créé**: 2025-01-10
- **Dernière mise à jour**: 2025-01-12
- **Features actives**: Dashboard + Console + Diagnostics
- **Composants**: 15 (hors shadcn/ui)
- **Routes**: 1 page + 3 API routes groups

---

## Notes

- Dashboard fonctionnel avec PM2 integration
- Sidebar toujours visible (navigation persistante)
- Console SSE real-time logs
- Diagnostics system monitoring complet
- **NEXT:** Ajouter apps Kanban/Todo/Tasks avec PostgreSQL
