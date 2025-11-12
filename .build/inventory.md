# Code Inventory - BUILDER Frontend

> **Auto-maintained by skills after each feature**
>
> Source de vérité pour anti-duplication
>
> Last updated: 2025-01-12 14:45

---

## Stack Technique

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui (57 components READ-ONLY)
- **Styling:** Tailwind CSS 4.x
- **State:** React 19 hooks
- **Forms:** react-hook-form + zod

### Backend
- **Platform:** Node.js
- **Database:** PostgreSQL (port 5434)
- **Process Manager:** PM2

---

## UI Components Library

### shadcn/ui (READ-ONLY - 57 composants)

**Location:** `components/ui/`

**RÈGLE ABSOLUE:** JAMAIS modifier ces fichiers, toujours réutiliser as-is

**Available:**
- **Layout:** card, sheet, dialog, separator, aspect-ratio, scroll-area
- **Navigation:** tabs, menubar, navigation-menu, breadcrumb, pagination
- **Forms:** input, button, checkbox, radio-group, select, slider, switch, textarea, label
- **Data Display:** table, avatar, badge, progress, skeleton, tooltip
- **Feedback:** alert, alert-dialog, toast, sonner
- **Overlays:** popover, dropdown-menu, context-menu, hover-card, command
- **Advanced:** accordion, collapsible, carousel, resizable, toggle, toggle-group, calendar, date-picker

### Custom Components

| Component | Path | Type | Dependencies | Purpose |
|-----------|------|------|--------------|---------|
| sidebar-nav.tsx | components/ | Client | Link, Button, ScrollArea | Navigation principale + Apps links (with Next.js Link) |
| project-console.tsx | components/ | Client | Card, Badge, ScrollArea | SSE logs streaming real-time |
| pm2-process-list.tsx | components/ | Server | Table, Badge | Liste projets PM2 |
| project-actions.tsx | components/ | Client | Button, DropdownMenu | Actions projet (stop/restart/delete) |
| new-project-dialog.tsx | components/ | Client | Dialog, Input, Form | Création nouveau projet |
| diagnostics-overview.tsx | components/ | Server | Card, Badge | Vue d'ensemble système |
| diagnostics-tabs.tsx | components/ | Client | Tabs | Tabs diagnostics system |
| diagnostics-ports.tsx | components/ | Server | Table, Badge | Scan ports TCP/UDP |
| systemd-services.tsx | components/ | Server | Table, Badge | Services Linux monitoring |
| vnc-viewer.tsx | components/ | Client | Card | VNC remote display |
| todo-detail-sheet.tsx | components/features/todo/ | Client | Sheet, Badge, Checkbox, Textarea | Todo detail panel avec subtasks, comments, attachments |
| kanban-board.tsx | components/features/kanban/ | Client | @dnd-kit, Card, Badge | Kanban board drag-drop interface |
| todo-list.tsx | components/features/todo/ | Client | @dnd-kit, StatusTabs, TodoItem | Todo list with drag-drop reordering |

**Total:** 13 custom components

---

## Libraries & Dependencies

### Drag & Drop
- ❌ **Non installé actuellement**
- **Candidates si besoin:** @dnd-kit (recommandé), react-dnd, react-beautiful-dnd

### Forms & Validation
- ✅ **react-hook-form** @7.58.1
- ✅ **zod** @3.25.67
- ✅ **@hookform/resolvers** @5.1.1

### State Management
- ✅ **React hooks:** useState, useReducer, useContext
- ❌ **Pas de:** Zustand, Redux, Jotai

### Data Fetching
- ✅ **Native fetch** (Server Components, API routes)
- ❌ **Pas de:** TanStack Query, SWR, Apollo

### UI Libraries Installed
- ✅ **@radix-ui/** (38 packages - base shadcn/ui)
- ✅ **@dnd-kit/*** (4 packages) - drag & drop
- ✅ **lucide-react** @0.522.0 (icons)
- ✅ **recharts** @2.15.4 (charts)
- ✅ **date-fns** @4.1.0 (dates)
- ✅ **cmdk** @1.0.0 (command palette)
- ✅ **sonner** @2.0.6 (toasts)
- ✅ **vaul** @1.1.2 (drawers)

---

## Routes & Pages

### Pages
| Route | File | Type | Purpose |
|-------|------|------|---------|
| / | app/page.tsx | Server | Redirect → /dashboard |
| /dashboard | app/dashboard/page.tsx | Client | Dashboard principal (PM2 projects + client-side navigation) |
| /dashboard/apps/kanban | app/dashboard/apps/kanban/page.tsx | Server | Kanban board app |
| /dashboard/apps/todo | app/dashboard/apps/todo/page.tsx | Server | Todo list app |
| /dashboard/apps/tasks | app/dashboard/apps/tasks/page.tsx | Server | Tasks manager app |

### Layout Routes
| Route | File | Purpose |
|-------|------|---------|
| /dashboard/apps | app/dashboard/apps/layout.tsx | Shared layout with sidebar for all apps |

### API Routes
| Endpoint | File | Method | Purpose |
|----------|------|--------|---------|
| /api/projects | app/api/projects/route.ts | GET, POST, PUT, DELETE | CRUD projets PM2 |
| /api/logs/[project] | app/api/logs/[project]/route.ts | GET (SSE) | Streaming logs PM2 |
| /api/health/ports | app/api/health/ports/route.ts | GET | Scan ports TCP/UDP |
| /api/health/docker | app/api/health/docker/route.ts | GET | Docker containers status |
| /api/health/systemd | app/api/health/systemd/route.ts | GET | Systemd services monitoring |
| /api/health/network | app/api/health/network/route.ts | GET | Network connections actives |

---

## Data Models & Database

### Database Status
- **ORM:** ✅ Prisma 6.19.0 configuré
- **PostgreSQL:** Port 5433 configuré (builder_dashboard)
- **Migrations:** ✅ Schema synchronisé

### Models (Actuels)
| Model | Fields | Purpose |
|-------|--------|---------|
| KanbanTask | id, columnId, title, description, priority, assignee, dueDate, progress, attachments, comments, users, order | Kanban tasks management |
| KanbanColumn | id, title, order | Kanban columns |
| TodoItem | id, title, description, dueDate, priority, status, tags, subtasks, completed, completedAt | Todo items |
| TaskManager | id, title, status, label, priority, **assignee**, createdAt, updatedAt | Task management with Claude/User assignment |

**NEW:** TaskManager.assignee field (claude \| user) added with index

---

## Code Patterns & Conventions

### Client Component Pattern
```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function MyComponent() {
  const [state, setState] = useState()

  return <Button onClick={() => setState(...)}>Click</Button>
}
```

**Utiliser quand:**
- Interactions utilisateur (onClick, onChange)
- Hooks React (useState, useEffect, useContext)
- Browser APIs (localStorage, window)
- SSE, WebSocket

### Server Component Pattern
```tsx
import { db } from "@/lib/db"
import { Card } from "@/components/ui/card"

export default async function MyComponent() {
  const data = await db.query()

  return <Card>{data}</Card>
}
```

**Utiliser quand:**
- Data fetching
- Database queries
- Server-side operations
- Pas d'interactions

### Server Actions Pattern
```tsx
// app/actions/my-actions.ts
"use server"

export async function myAction(formData: FormData) {
  // DB operations
  revalidatePath("/")
}

// component.tsx
"use client"
import { myAction } from "@/app/actions/my-actions"

<form action={myAction}>...</form>
```

**Status:** ✅ Utilisé (tasks-actions.ts créé)

**Available Actions:**
- `app/actions/tasks-actions.ts`: CRUD TaskManager
  - `getTasks(filters?)`: Récupère tasks avec filtres (status, label, priority, **assignee**)
  - `createTask(data)`: Crée nouvelle task (assignee par défaut: "claude")
  - `updateTask(id, data)`: Modifie task existante
  - `deleteTask(id)`: Supprime task par ID
  - `bulkDeleteTasks(ids[])`: Supprime multiple tasks
- `app/actions/kanban-actions.ts`: Kanban board operations
- `app/actions/todo-actions.ts`: Todo list operations

### API Routes Pattern
```tsx
// app/api/my-route/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: ... })
}
```

**Status:** ✅ Utilisé (6 routes créées)

---

## Fonctionnalités Implémentées

### Dashboard Core
- [x] PM2 process management (liste, actions)
- [x] Sidebar navigation persistante
- [x] Dark mode support (next-themes)

### Console & Logs
- [x] SSE logs streaming real-time
- [x] Filtrage logs par mot-clé
- [x] Color-coded logs (error/warn/success)
- [x] Auto-scroll + clear logs

### Diagnostics & Monitoring
- [x] All ports monitor (TCP/UDP scan)
- [x] Systemd services status
- [x] Docker containers monitoring
- [x] VNC viewer integration

### Apps (✅ Navigation Fixed)
- [x] Kanban board (drag-drop tasks) - Navigation fixed with Next.js Link
- [x] Todo list (subtasks support) - Navigation fixed with Next.js Link
- [x] Tasks manager (filters, priorities) - Navigation fixed with Next.js Link
- [x] Sidebar persistence - Layout pattern applied

---

## Code À Réutiliser (Anti-Duplication)

### Helpers & Utils
| File | Exports | Purpose |
|------|---------|---------|
| lib/utils.ts | cn() | Tailwind class merger (clsx + twMerge) |

### Services
| File | Exports | Purpose |
|------|---------|---------|
| (À créer) | - | PM2 client wrapper si besoin |

### Hooks
| File | Exports | Purpose |
|------|---------|---------|
| (Aucun custom hook) | - | Utiliser React hooks natifs |

---

## External Source Code Available

### /tmp/shadcn-kit-temp (Cloned shadcn-ui-kit-dashboard)

**Location:** `/tmp/shadcn-kit-temp`

**Available modules:**
- ✅ `components/ui/kanban.tsx` (1036 lignes - drag-drop complet @dnd-kit)
- ✅ `apps/kanban/components/kanban-board.tsx` (740 lignes - implémentation complète)
- ✅ `apps/todo-list-app/components/` (todo-list.tsx, todo-item.tsx, todo-detail-sheet.tsx)
- ✅ `apps/todo-list-app/tasks.tsx` (tasks manager)

**Strategy:** COPY + ADAPT pour PostgreSQL backend

---

## Performance Metrics

- **Total Components:** 11 custom (+ 57 shadcn/ui)
- **Total Routes:** 1 page + 6 API routes
- **Total Dependencies:** 67 packages (12 core, 38 @radix-ui, 17 utilities)
- **Bundle Size:** (À mesurer après build)
- **Build Time:** (À mesurer après first build)

---

## Anti-Duplication Rules

### AVANT créer composant:
1. ✅ Check shadcn/ui 57 components (TOUJOURS réutiliser)
2. ✅ Check custom components table
3. ✅ Check external source (/tmp/shadcn-kit-temp)
4. ✅ Glob scan: `components/**/*[keyword]*.tsx`
5. ✅ Grep scan: `keyword` dans codebase

### AVANT installer library:
1. ✅ Check "Libraries & Dependencies" section
2. ✅ Read package.json
3. ✅ Check si alternative déjà installée

### AVANT créer pattern:
1. ✅ Check "Code Patterns" section
2. ✅ Grep scan pattern existant
3. ✅ Réutiliser convention établie

---

## Maintenance Log

| Date | Action | By | Files Changed |
|------|--------|-----|--------------|
| 2025-01-12 14:45 | Initial inventory created | orchestrator | inventory.md |
| 2025-11-12 15:30 | Added TaskManager Server Actions | executor+backend | app/actions/tasks-actions.ts |
| 2025-11-12 16:45 | Added TodoDetailSheet component (COPY+ADAPT) | executor+frontend | components/features/todo/todo-detail-sheet.tsx |
| 2025-11-12 17:00 | Added TaskManager.assignee field (claude \| user) | executor+database | prisma/schema.prisma, app/actions/tasks-actions.ts |
| 2025-11-12 18:15 | Fixed sidebar navigation persistence for Apps | executor+frontend | components/sidebar-nav.tsx, app/dashboard/apps/layout.tsx |

---

**Next Update:** Après implémentation UI pour filtrer par assignee
