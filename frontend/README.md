# Builder Frontend Base

> **Base Lego frontend pour système Builder**
> Next.js 16 + shadcn/ui + Tailwind v4 + TypeScript

---

## 📦 Contenu

**Composants shadcn/ui (60 composants):**
- `components/ui/` - Kit complet shadcn (button, card, dialog, form, etc.)

**Styles:**
- `app/globals.css` - Tailwind base + shadcn variables
- `app/themes.css` - Thèmes couleurs

**Config:**
- `components.json` - Configuration shadcn
- `tsconfig.json` - TypeScript strict
- `next.config.ts` - Next.js 16
- `postcss.config.mjs` - PostCSS + Tailwind v4

**Libs:**
- `lib/utils.ts` - Helper `cn()` pour class merging

---

## 🎯 Usage Builder

**Workflow automatique:**

1. **Nouveau projet détecté** → Executor clone cette base
2. **Composants ui/ disponibles** → Anti-duplication check automatique
3. **Customs dans features/** → Executor crée composants custom

```
votre-projet/
├── components/
│   ├── ui/              ← Clôné depuis BUILDER-FRONTEND-BASE
│   ├── layout/          ← Créé par executor (Sidebar, Header)
│   └── features/        ← Créé par executor (Kanban, Timer, etc)
├── app/
│   ├── globals.css      ← Clôné depuis base
│   ├── themes.css       ← Clôné depuis base
│   └── dashboard/       ← Créé par executor
├── lib/
│   └── utils.ts         ← Clôné depuis base
└── [configs]            ← Clônés depuis base
```

---

## 🛠 Stack

**Core:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5.8
- Tailwind CSS v4

**UI:**
- shadcn/ui (Radix UI primitives)
- Lucide React (icons)
- Tailwind Animate
- Vaul (drawers)

**Forms & Validation:**
- React Hook Form
- Zod

**Data & State:**
- React Query (TanStack)
- Recharts (charts)

**Interactions:**
- dnd-kit (drag & drop)
- React Resizable Panels
- Sonner (toasts)

---

## 📋 Composants Disponibles

**Inputs:**
- Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider

**Data Display:**
- Table, Card, Badge, Avatar, Skeleton, Progress, Calendar

**Feedback:**
- Alert, Dialog, Sheet, Popover, Tooltip, Toast

**Navigation:**
- Dropdown Menu, Menubar, Navigation Menu, Tabs, Breadcrumb, Pagination

**Layout:**
- Separator, Scroll Area, Resizable, Collapsible, Accordion

**Advanced:**
- Command, Context Menu, Hover Card

---

## 🚀 Installation (si utilisation manuelle)

```bash
npm install
```

**Note:** Executor fait ça automatiquement lors du clone.

---

## 📌 Convention Builder

**RÈGLES STRICTES (skill frontend):**

1. ✅ **1 seul globals.css** (Tailwind directives)
2. ✅ **Imports depuis @/components/ui** uniquement
3. ✅ **Pas de duplication composants** (check avant créer)
4. ✅ **Server Components par défaut** (Client si hooks)
5. ✅ **Tailwind uniquement** (pas CSS-in-JS, pas modules)

**Anti-duplication:**
- Executor lit `components.json` → Détecte shadcn installé
- Executor Glob `components/ui/*.tsx` → Liste composants disponibles
- Executor **JAMAIS** recrée Button, Card, etc si existe
- Customs **TOUJOURS** dans `components/features/[nom-feature]/`

---

## 📂 Structure Type Projet Final

```
projet-ticktick/
├── .build/              # Documentation Builder
│   ├── context.md
│   ├── specs.md
│   └── timeline.md
├── app/
│   ├── globals.css      ← DE BASE
│   ├── themes.css       ← DE BASE
│   ├── layout.tsx       ← CRÉÉ executor
│   └── dashboard/       ← CRÉÉ executor
│       ├── layout.tsx   (ResizablePanel + Sidebar)
│       └── page.tsx     (Server Component)
├── components/
│   ├── ui/              ← DE BASE (60 composants shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/          ← CRÉÉ executor
│   │   └── sidebar.tsx
│   └── features/        ← CRÉÉ executor
│       ├── kanban/
│       │   ├── board.tsx
│       │   ├── column.tsx
│       │   └── task-card.tsx
│       ├── pomodoro/
│       │   └── timer.tsx
│       └── tasks/
│           └── task-form.tsx
├── lib/
│   ├── utils.ts         ← DE BASE
│   └── prisma.ts        ← CRÉÉ executor (si backend)
├── prisma/              ← CRÉÉ executor (si backend)
│   └── schema.prisma
├── components.json      ← DE BASE
├── tsconfig.json        ← DE BASE
├── next.config.ts       ← DE BASE
└── package.json         ← DE BASE (modifié par executor)
```

---

## 🎨 Thèmes

**Thèmes inclus (themes.css):**
- Default
- Dark mode support (next-themes)

**CSS Variables:**
- Couleurs shadcn standardisées
- Support dark mode automatique

---

## ⚙️ Config Tailwind v4

**PostCSS + Tailwind v4** (pas de tailwind.config classique)

Tailwind configuré via:
- `@tailwindcss/postcss`
- CSS `@import "tailwindcss"`

---

## 📖 Documentation

**Références:**
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js 16](https://nextjs.org/)
- [Tailwind v4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Maintenu par:** Builder System
**Version:** 1.0.0
**Dernière mise à jour:** 2025-11-10
