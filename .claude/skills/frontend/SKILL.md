---
name: frontend
description: Universal React/Next.js frontend expert. Handles shadcn/ui components, Tailwind CSS, Server/Client Components, anti-duplication checks. Auto-activates on keywords "frontend", "UI", "component", "page", "shadcn", "React", "Next.js" or paths app/**, components/**.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Frontend Development Skill

> **Universal React/Next.js Frontend Expert**
>
> Inspiré de : Vercel DX Principles, shadcn/ui Philosophy, Tailwind Best Practices

---

## Scope & Activation

**Chargé par:** EXECUTOR agent

**Auto-activé si keywords:**
- `frontend`, `UI`, `composant`, `page`, `dashboard`
- `React`, `Next.js`, `shadcn`, `Tailwind`
- `button`, `dialog`, `form`, `layout`
- Paths: `app/**`, `components/**`, `*.tsx`, `*.css`

**Frameworks supportés:**
- Next.js 14+ (App Router)
- React 18+ (avec Server/Client Components)
- shadcn/ui (Radix + Tailwind)
- Tailwind CSS 3+

---

## Auto-Détection Base Frontend (OBLIGATOIRE Phase 0)

**AVANT toute action, vérifier si base frontend existe dans projet:**

### Workflow Détection (STRICT)

```
1. Check si projet est NOUVEAU (pas de components/)
   → SI nouveau: Clone depuis BUILDER/.stack/

2. Check si components.json existe
   → SI absent: Clone depuis BUILDER/.stack/
   → SI présent: Read components.json

3. Read components.json → Récupère aliases
   → Vérifier: aliases.ui = "@/components/ui"
   → Vérifier: aliases.components = "@/components"

4. Glob components/ui/*.tsx
   → Liste tous composants shadcn disponibles
   → Update mental map: "[X] composants shadcn disponibles"

5. SI components/ui/ vide ou absent
   → Clone depuis BUILDER/.stack/
```

**Path base frontend (relatif):**
```
BUILDER/.stack/
```

**Localisation base:**
- Chercher dossier BUILDER/ en remontant arborescence
- Ou utiliser variable env si configurée
- Path par défaut: `../../BUILDER/.stack/` (depuis projet)

**Contenu base (à cloner):**
- `components/ui/` - 57 composants shadcn
- `app/globals.css` + `app/themes.css`
- `lib/utils.ts` + `lib/compose-refs.ts`
- `components.json` (config shadcn)
- `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- `package.json` (dependencies optimisées)

**Commande clone (EXACTE - copy-paste ready):**

```bash
# ÉTAPE 1: Trouver BUILDER/.stack/ (méthode fiable)
# Cherche dans home directory
BUILDER_DIR=$(find ~ -maxdepth 3 -type d -name "BUILDER" 2>/dev/null | head -1)

# Si pas trouvé dans home, cherche partout (plus lent)
if [ -z "$BUILDER_DIR" ]; then
  BUILDER_DIR=$(find /home -maxdepth 4 -type d -name "BUILDER" 2>/dev/null | head -1)
fi

# Path .stack/
BUILDER_STACK="$BUILDER_DIR/.stack"

# ÉTAPE 2: Vérifier .stack/ existe
if [ ! -d "$BUILDER_STACK" ]; then
  echo "❌ BUILDER/.stack/ non trouvé"
  echo ""
  echo "Clone BUILDER repo d'abord:"
  echo "  cd ~"
  echo "  git clone https://github.com/nera0875/BUILDER.git"
  echo ""
  echo "Puis relance la commande"
  exit 1
fi

# ÉTAPE 3: Clone base frontend
echo "📦 Clone base frontend depuis $BUILDER_STACK"

# Copy tous les fichiers ET dossiers (y compris hidden)
cp -r "$BUILDER_STACK"/* . 2>/dev/null
cp -r "$BUILDER_STACK"/.[!.]* . 2>/dev/null

# ÉTAPE 4: Install dependencies
echo "📥 Installation dependencies..."
npm install

echo "✅ Base frontend clonée (57 composants shadcn ready)"
```

**Alternative si find échoue (fallback manuel):**

```bash
# Si commande automatique échoue, donner instructions user:
echo "❌ Détection automatique échouée"
echo ""
echo "Clone manuellement:"
echo ""
echo "1. Localise BUILDER repo:"
echo "   cd ~/BUILDER  # ou ton path"
echo ""
echo "2. Copy .stack/ vers projet:"
echo "   cp -r ~/.../BUILDER/.stack/* /ton/projet/"
echo ""
echo "3. Install dependencies:"
echo "   cd /ton/projet && npm install"
```

**Principe:** find limité à 3-4 depth max (performance). Si projet BUILDER bien placé (~/BUILDER ou ~/tools/BUILDER), détection auto fonctionne.

**Exemple détection:**
```json
// components.json trouvé
{
  "aliases": {
    "ui": "@/components/ui",
    "components": "@/components"
  }
}
```
→ **Conclusion:** Kit shadcn installé, vérifier components/ui/

**Impact anti-duplication:**
- ❌ Ne JAMAIS recréer `components/ui/button.tsx` si existe
- ❌ Ne JAMAIS run `npx shadcn init` si components.json existe
- ❌ Ne JAMAIS run `npx shadcn add button` si components/ui/button.tsx existe
- ✅ Importer depuis `@/components/ui/button`
- ✅ Créer composants custom dans `components/features/` uniquement

---

## ❌ ZONES INTERDITES (READ-ONLY - JAMAIS TOUCHER)

### components/ui/ - KIT SHADCN (STRICTEMENT INTERDIT)

**RÈGLES ABSOLUES:**
- ❌ Créer nouveau fichier dans `components/ui/`
- ❌ Modifier fichiers existants `components/ui/*.tsx`
- ❌ Supprimer composants shadcn
- ❌ Renommer fichiers `ui/`
- ❌ Ajouter props custom aux composants ui/
- ❌ Refactor code dans `ui/`

**SEULE ACTION AUTORISÉE:**
- ✅ **Importer uniquement** depuis `@/components/ui/[composant]`

```tsx
// ✅ AUTORISÉ
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

// ❌ INTERDIT
// Modifier components/ui/button.tsx
// Créer components/ui/custom-button.tsx
```

**Raison:** `components/ui/` = Lego blocks de base shadcn. **READ-ONLY STRICT.** Customs dans `features/`.

---

### app/globals.css - STYLES GLOBAUX (1 SEUL FICHIER)

**INTERDIT:**
- ❌ Créer nouveaux fichiers `.css` (styles.css, custom.css, etc)
- ❌ CSS modules (`.module.css`)
- ❌ Styled-components
- ❌ CSS-in-JS (emotion, etc)
- ❌ Modifier directives Tailwind existantes (`@tailwind base`, etc)
- ❌ Supprimer CSS variables shadcn (`:root`, `.dark`)

**AUTORISÉ UNIQUEMENT:**
- ✅ Ajouter `@layer utilities` dans `globals.css` existant (si absolument nécessaire)

```css
/* ✅ AUTORISÉ dans globals.css existant */
@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
}

/* ❌ INTERDIT - Pas de nouveau fichier CSS */
/* Pas de custom.css, styles.css, etc */
```

**Raison:** 1 seul point styling global (Tailwind). Fragmentation = chaos maintenance.

---

### app/themes.css - THÈMES SHADCN (READ-ONLY)

**INTERDIT:**
- ❌ Modifier variables CSS existantes
- ❌ Supprimer thèmes
- ❌ Ajouter nouveaux thèmes (sauf demande explicite user)

**Raison:** Thèmes shadcn pré-configurés. Modification = casse dark mode.

---

### lib/utils.ts - CN HELPER (READ-ONLY)

**INTERDIT:**
- ❌ Modifier fonction `cn()` (helper shadcn)
- ❌ Supprimer imports `clsx` ou `tailwind-merge`

**AUTORISÉ:**
- ✅ Créer nouveaux helpers dans fichiers séparés: `lib/[custom].ts`

```tsx
// ❌ INTERDIT - Modifier lib/utils.ts
export function cn(...) { /* NE PAS TOUCHER */ }

// ✅ AUTORISÉ - Nouveau fichier
// lib/date-helpers.ts
export function formatDate(date: Date) {
  return date.toLocaleDateString();
}
```

**Raison:** `cn()` = core shadcn helper. Modification = casse tous composants.

---

### Fichiers Config (READ-ONLY sauf cas spécifiques)

**INTERDIT de modifier sans raison:**
- ❌ `components.json` (config shadcn)
- ❌ `tsconfig.json` (TypeScript paths)
- ❌ `next.config.ts` (Next.js config)
- ❌ `postcss.config.mjs` (PostCSS config)
- ❌ `tailwind.config.ts` (si existe - Tailwind v3)

**AUTORISÉ seulement si:**
- ✅ Feature nécessite nouvelle lib → Update `next.config.ts`
- ✅ Nouveau alias path → Update `tsconfig.json` paths
- ✅ Nouveau plugin Tailwind → Update `tailwind.config.ts`

**Principe:** Config établie = stable. Modification = risque régression.

---

## ✅ OÙ CRÉER NOUVEAUX COMPOSANTS/FICHIERS

### components/features/[feature]/ - COMPOSANTS CUSTOM

**Structure recommandée:**

```
components/
├── ui/                        ← READ-ONLY (shadcn)
│   └── button.tsx
├── layout/                    ← CRÉER ICI (layouts app)
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── footer.tsx
└── features/                  ← CRÉER ICI (composants métier)
    ├── dashboard/
    │   ├── stats-card.tsx     ← Custom composant (utilise ui/card)
    │   ├── chart.tsx
    │   └── filters.tsx
    ├── kanban/
    │   ├── board.tsx
    │   ├── column.tsx
    │   └── task-card.tsx      ← Custom composant (utilise ui/card)
    └── pomodoro/
        └── timer.tsx
```

**Exemple composant custom:**

```tsx
// components/features/dashboard/stats-card.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export function StatsCard({ title, value, trend }) {
  return (
    <Card className="border-2 border-primary/20 hover:shadow-lg transition">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TrendingUp className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">
          {trend > 0 ? "+" : ""}{trend}% from last month
        </p>
      </CardContent>
    </Card>
  );
}
```

**Principe:** Compose avec `ui/`, custom styling via Tailwind className, logique métier séparée.

---

### components/layout/ - LAYOUTS APP

**Créer ici:**
- Sidebar navigation
- Header/Navbar
- Footer
- AppShell/DashboardLayout

**Exemple:**

```tsx
// components/layout/sidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Home, Settings, User } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="h-full border-r bg-card">
      <nav className="flex flex-col gap-2 p-4">
        <Button variant="ghost" className="justify-start">
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button variant="ghost" className="justify-start">
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button variant="ghost" className="justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>
    </aside>
  );
}
```

---

### app/[route]/ - PAGES NEXT.JS

**Structure app router:**

```
app/
├── globals.css              ← READ-ONLY (sauf @layer utilities)
├── themes.css               ← READ-ONLY
├── layout.tsx               ← CRÉER (root layout)
├── page.tsx                 ← CRÉER (home page)
├── dashboard/
│   ├── layout.tsx           ← CRÉER (dashboard layout avec sidebar)
│   ├── page.tsx             ← CRÉER (dashboard home)
│   └── settings/
│       └── page.tsx         ← CRÉER (nested route)
└── (auth)/                  ← CRÉER (route group)
    ├── login/
    │   └── page.tsx
    └── register/
        └── page.tsx
```

**Exemple page:**

```tsx
// app/dashboard/page.tsx (Server Component)
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/features/dashboard/stats-card";

export default async function DashboardPage() {
  const stats = await prisma.task.groupBy({
    by: ['status'],
    _count: true
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      {stats.map(stat => (
        <StatsCard
          key={stat.status}
          title={stat.status}
          value={stat._count}
          trend={12}
        />
      ))}
    </div>
  );
}
```

---

### lib/ - UTILITIES CUSTOM

**Créer nouveaux helpers:**

```
lib/
├── utils.ts           ← READ-ONLY (cn helper shadcn)
├── date-helpers.ts    ← CRÉER (custom date utils)
├── api-client.ts      ← CRÉER (fetch wrapper)
├── validators.ts      ← CRÉER (Zod schemas)
└── constants.ts       ← CRÉER (app constants)
```

**Exemple:**

```tsx
// lib/date-helpers.ts
import { format } from "date-fns";

export function formatDate(date: Date): string {
  return format(date, "MMM dd, yyyy");
}

export function formatDateTime(date: Date): string {
  return format(date, "MMM dd, yyyy HH:mm");
}
```

---

### hooks/ - CUSTOM REACT HOOKS

**Créer hooks custom:**

```
hooks/
├── use-local-storage.ts
├── use-media-query.ts
└── use-debounce.ts
```

**Exemple:**

```tsx
// hooks/use-local-storage.ts
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) setStoredValue(JSON.parse(item));
  }, [key]);

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}
```

---

## Workflow Création Composant (STRICT - Phase par Phase)

### Phase 0: Vérification Base Clonée

**AVANT toute création composant:**

```bash
# Vérifier base frontend clonée depuis BUILDER/.stack/
ls components/ui/ && echo "✅ Base OK" || echo "❌ CLONE BASE FIRST"
```

**SI base absente:** Clone BUILDER/.stack/ (voir section Auto-Détection)

---

### Phase 1: Anti-Duplication Check (OBLIGATOIRE)

**1. ✅ Check si composant shadcn existe dans `components/ui/`**
```bash
ls components/ui/button.tsx     # Existe? (OUI = 99% cas) → Réutilise
ls components/ui/card.tsx       # Existe? (OUI = 99% cas) → Réutilise
ls components/ui/dialog.tsx     # Existe? (OUI = 99% cas) → Réutilise
```

**Rappel:** BUILDER/.stack/ contient **57 composants shadcn**.
Ne JAMAIS recréer si existe.

**2. ✅ Check si composant custom existe dans `components/features/`**
```bash
grep -r "StatsCard" components/features/  # Existe? → Réutilise
grep -r "TaskCard" components/features/   # Existe? → Réutilise
```

---

### Phase 2: Décision Emplacement

**3. ✅ Décide emplacement selon type:**

| Type composant | Emplacement | Exemple |
|----------------|-------------|---------|
| Layout app | `components/layout/` | `sidebar.tsx`, `header.tsx` |
| Composant métier | `components/features/[feature]/` | `stats-card.tsx`, `task-card.tsx` |
| Page Next.js | `app/[route]/page.tsx` | `app/dashboard/page.tsx` |
| Hook custom | `hooks/` | `use-local-storage.ts` |
| Util custom | `lib/` | `date-helpers.ts` |

---

### Phase 3: Composition avec Base

**4. ✅ Compose avec shadcn ui/ (base)**
- Import depuis `@/components/ui/[composant]`
- Styling via Tailwind className uniquement
- Logique métier custom dans composant

```tsx
// ✅ CORRECT - Composition
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StatsCard({ title, value }) {
  return (
    <Card className="border-2 border-primary/20">  {/* Custom styling */}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-3xl font-bold">{value}</p>
      </CardHeader>
    </Card>
  );
}
```

---

### Phase 4: Server vs Client

**5. ✅ "use client" si nécessaire (CHECKLIST)**

**OBLIGATOIRE "use client" SI:**
- ✅ Hooks React (`useState`, `useEffect`, `useContext`)
- ✅ Event handlers (`onClick`, `onChange`, `onSubmit`)
- ✅ Browser APIs (`window`, `document`, `localStorage`)
- ✅ Third-party libs interactives (react-hook-form)

**PAS "use client" SI:**
- ✅ Fetch data serveur (Prisma, fetch API)
- ✅ Pas d'interactivité (display statique)
- ✅ SEO important

```tsx
// ✅ Client Component (hooks + events)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
}
```

```tsx
// ✅ Server Component (fetch data)
import { prisma } from "@/lib/prisma";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany();
  return <div>{tasks.map(t => <div key={t.id}>{t.name}</div>)}</div>;
}
```

---

### Pattern création composant custom

```tsx
// components/features/kanban/task-card.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash, Edit } from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    priority: "low" | "medium" | "high";
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="group hover:shadow-md transition cursor-pointer">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <Badge
            variant={task.priority === "high" ? "destructive" : "secondary"}
            className="mt-2"
          >
            {task.priority}
          </Badge>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
```

**Checklist:**
- ✅ Imports depuis `@/components/ui/`
- ✅ "use client" (car onClick events)
- ✅ TypeScript interface
- ✅ Styling Tailwind uniquement
- ✅ Composition (Card + Button + Badge depuis ui/)
- ✅ Props typées
- ✅ Logique métier (onEdit, onDelete callbacks)

---

## Architecture Stricte (Non-Negotiable)

### tsconfig.json paths (OBLIGATOIRE)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**OU** si pas de `/src`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### Structure Projet Standard (après clone BUILDER/.stack/)

**Structure EXACTE après clone base:**

```
projet/
├── .gitignore                    ← DE BASE
├── README.md                     ← PEUT modifier (doc projet)
├── package.json                  ← DE BASE (modifiable npm install)
├── tsconfig.json                 ← DE BASE (READ-ONLY sauf alias)
├── next.config.ts                ← DE BASE (READ-ONLY sauf feature)
├── postcss.config.mjs            ← DE BASE (READ-ONLY)
├── components.json               ← DE BASE (READ-ONLY)
│
├── app/
│   ├── globals.css               ← DE BASE (READ-ONLY sauf @layer)
│   ├── themes.css                ← DE BASE (READ-ONLY)
│   ├── layout.tsx                ← CRÉER (root layout)
│   ├── page.tsx                  ← CRÉER (home page)
│   ├── dashboard/                ← CRÉER (feature routes)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── (auth)/                   ← CRÉER (route groups)
│       ├── login/
│       └── register/
│
├── components/
│   ├── ui/                       ← DE BASE (57 composants READ-ONLY)
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (53 autres)
│   ├── layout/                   ← CRÉER (layouts app)
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── features/                 ← CRÉER (composants métier)
│       ├── dashboard/
│       │   ├── stats-card.tsx
│       │   └── chart.tsx
│       └── kanban/
│           └── board.tsx
│
├── lib/
│   ├── utils.ts                  ← DE BASE (READ-ONLY)
│   ├── compose-refs.ts           ← DE BASE (READ-ONLY)
│   ├── prisma.ts                 ← CRÉER (si backend)
│   └── date-helpers.ts           ← CRÉER (custom utils)
│
├── hooks/                        ← CRÉER (custom hooks)
│   └── use-local-storage.ts
│
├── public/                       ← CRÉER (assets)
│   ├── images/
│   └── fonts/
│
└── prisma/                       ← CRÉER (si backend)
    └── schema.prisma
```

**Légende:**
- `← DE BASE` = Fichier cloné BUILDER/.stack/ (READ-ONLY ou modifiable conditions)
- `← CRÉER` = Fichier à créer par executor selon features

**Principe:** Base stable BUILDER/.stack/ (ui/ + configs), customs dans features/.
(Vercel: "Colocation for features", shadcn: "Components in one place")

---

## Règles Tailwind CSS (STRICT)

### 1 seul globals.css (BUILDER/.stack/ inclus)

**⚠️ ATTENTION: globals.css déjà fourni par BUILDER/.stack/**

**Emplacement standard:** `app/globals.css` (Tailwind v4)

**Contenu base (déjà configuré):**

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... 20+ variables shadcn */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

**DÉJÀ importé dans:** Root layout (à créer selon template BUILDER/.stack/)

```tsx
// app/layout.tsx (créer ce fichier)
import "./globals.css";  // ✅ Déjà présent dans base
import "./themes.css";   // ✅ Déjà présent dans base
```

**Modifications AUTORISÉES uniquement:**
```css
/* app/globals.css - Ajouter EN BAS du fichier */
@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--primary));
    border-radius: 4px;
  }
}
```

**Modifications INTERDITES:**
- ❌ Changer `@import "tailwindcss"` (Tailwind v4 syntax)
- ❌ Modifier CSS variables `:root` existantes (casse shadcn)
- ❌ Supprimer `.dark` variables (casse dark mode)
- ❌ Créer nouveau fichier CSS global

---

### Interdictions formelles

❌ **CSS Modules** (`.module.css`)
- Conflit avec Tailwind utility-first
- Fragmentation styling

❌ **Multiple fichiers Tailwind**
- 1 seul `tailwind.config.ts`
- 1 seul `globals.css`

❌ **CSS-in-JS** (styled-components, emotion)
- Runtime overhead
- Conflit paradigme Tailwind

❌ **Inline styles** (sauf valeurs dynamiques obligatoires)

```tsx
// ❌ INTERDIT
<div style={{ display: 'flex', padding: '1rem' }}>

// ✅ CORRECT
<div className="flex p-4">

// ✅ EXCEPTION (valeur dynamique)
<div style={{ width: `${progress}%` }} className="h-2 bg-blue-500" />
```

---

### Tailwind uniquement

```tsx
// ✅ Classes utilitaires Tailwind
<div className="flex items-center justify-between gap-4 p-6 rounded-lg bg-card text-card-foreground shadow-sm">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button variant="outline" size="sm">Action</Button>
</div>
```

**Responsive:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Dark mode (CSS variables):**

```tsx
<div className="bg-background text-foreground">
  // Automatique via CSS vars --background / --foreground
</div>
```

---

## shadcn/ui Components (Anti-Duplication STRICTE)

### Imports UNIQUEMENT depuis `/components/ui`

```tsx
// ✅ CORRECT
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ❌ INTERDIT
import { Button } from "@/registry/default/ui/button";
import { Button } from "../../ui/button"; // Paths relatifs
import { Button } from "shadcn-ui"; // N'existe pas
```

---

### Vérification AVANT ajout composant (WORKFLOW ANTI-DUPLICATION)

**Phase 1: Check BUILDER/.stack/ (57 composants inclus)**

```bash
# TOUJOURS vérifier dans base AVANT shadcn add
ls components/ui/button.tsx         # Existe? (99% OUI si base clonée)
ls components/ui/card.tsx           # Existe? (99% OUI si base clonée)
ls components/ui/dialog.tsx         # Existe? (99% OUI si base clonée)
```

**Phase 2: Décision selon résultat**

**SI existe dans components/ui/:**
→ ✅ **RÉUTILISE** (import depuis `@/components/ui/[composant]`)
→ ✅ **Extend via className** si variant custom
→ ❌ **NE JAMAIS run `npx shadcn add`** (duplication interdite)

```tsx
// ✅ CORRECT - Réutilisation
import { Button } from "@/components/ui/button";

<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  Custom Style
</Button>
```

**SI n'existe PAS (rare - composant non standard):**
→ ⚠️ Vérifier composant vraiment shadcn standard
→ ✅ Installer via CLI shadcn si vraiment nécessaire

```bash
# SEULEMENT si composant absent ET shadcn officiel
npx shadcn@latest add [composant]
```

**Composants 100% couverts par BUILDER/.stack/ (57):**
- accordion, alert, alert-dialog, aspect-ratio, avatar
- badge, breadcrumb, button, calendar, card
- carousel, checkbox, collapsible, command, context-menu
- dialog, drawer, dropdown-menu, form, hover-card
- input, input-otp, label, menubar, navigation-menu
- pagination, popover, progress, radio-group, resizable
- scroll-area, select, separator, sheet, skeleton
- slider, sonner, switch, table, tabs
- textarea, toast, toggle, toggle-group, tooltip
- ... (et 12+ autres)

**Principe:** Base BUILDER/.stack/ = 57 composants. shadcn add = EXCEPTION rare.
(Builder: "Lego base first, shadcn CLI last resort")

---

### Liste EXACTE Composants BUILDER/.stack/ (57)

**AVANT utiliser, TOUJOURS vérifier disponibilité:**
```bash
ls components/ui/[composant].tsx
```

**Composants inclus dans base (par catégorie):**

**Forms (9):**
- `checkbox`, `form`, `input`, `input-otp`, `label`
- `radio-group`, `select`, `slider`, `switch`, `textarea`

**Data Display (8):**
- `avatar`, `badge`, `calendar`, `card`, `progress`
- `skeleton`, `table`, `chart` (via recharts)

**Feedback (10):**
- `alert`, `alert-dialog`, `dialog`, `drawer`, `hover-card`
- `popover`, `sheet`, `toast`, `tooltip`, `sonner`

**Navigation (7):**
- `breadcrumb`, `dropdown-menu`, `menubar`, `navigation-menu`
- `pagination`, `tabs`, `command`

**Layout (6):**
- `accordion`, `aspect-ratio`, `collapsible`, `resizable`
- `scroll-area`, `separator`

**Buttons (3):**
- `button`, `toggle`, `toggle-group`

**Advanced (14):**
- `carousel`, `context-menu`, `date-picker`, `combobox`
- Et 10+ autres composants spécialisés

**Total: 57 composants** ✅ **100% coverage besoins standards**

**Check rapide disponibilité:**
```bash
# Vérifier si composant existe
ls components/ui/button.tsx && echo "✅ Disponible" || echo "❌ Absent"
```

**Si composant absent:** Vérifier orthographe ou installer via `npx shadcn add [nom]`

---

### Pas de duplication components

❌ **Créer nouveau composant si existe déjà**

```
components/
├── ui/
│   └── button.tsx          ← shadcn Button existe
├── button.tsx              ← ❌ DUPLICATION INTERDITE
└── custom-button.tsx       ← ❌ DUPLICATION INTERDITE
```

✅ **Extend via props/className si besoin custom**

```tsx
// components/features/dashboard/action-button.tsx
import { Button } from "@/components/ui/button";

export function ActionButton({ children, ...props }) {
  return (
    <Button
      variant="default"
      className="bg-gradient-to-r from-blue-500 to-purple-500"
      {...props}
    >
      {children}
    </Button>
  );
}
```

**Principe:** Composition over duplication.
(shadcn: "Use what's there, extend what you need", React: "Composition is key")

---

## Server vs Client Components (Next.js App Router)

### Server Components (par défaut)

**Utiliser SI:**
- Fetch data (database, API)
- Pas d'interactivité (statique)
- SEO important
- Pas de hooks React (`useState`, `useEffect`, etc)
- Pas de browser APIs (`window`, `document`)

```tsx
// app/dashboard/page.tsx (Server Component par défaut)

import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/features/dashboard/stats-card";

export default async function DashboardPage() {
  // Fetch côté serveur
  const stats = await prisma.task.groupBy({
    by: ['status'],
    _count: true
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(stat => (
        <StatsCard key={stat.status} data={stat} />
      ))}
    </div>
  );
}
```

**Avantages:**
- ✅ Zero JavaScript client (performance)
- ✅ SEO optimal (HTML complet)
- ✅ Accès direct DB/API

---

### Client Components (opt-in via `"use client"`)

**OBLIGATOIRE SI:**
- `useState`, `useEffect`, `useContext`, `useReducer`
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- Browser APIs (`window`, `document`, `localStorage`)
- Custom hooks
- Third-party libs avec side effects

```tsx
// components/features/dashboard/stats-card.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StatsCard({ data }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.status}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{data._count}</p>
        <Button onClick={() => setExpanded(!expanded)} variant="ghost">
          {expanded ? "Collapse" : "Expand"}
        </Button>
        {expanded && <div>Details...</div>}
      </CardContent>
    </Card>
  );
}
```

**Règle:** `"use client"` = première ligne du fichier (avant imports)

---

### Pattern Optimal: Server → Client

**Server Component (data fetching):**

```tsx
// app/dashboard/page.tsx (Server)
import { ClientDashboard } from "./client-dashboard";

export default async function DashboardPage() {
  const data = await fetchData(); // Server-side

  return <ClientDashboard data={data} />; // Pass to Client
}
```

**Client Component (interactivity):**

```tsx
// app/dashboard/client-dashboard.tsx
"use client";

import { useState } from "react";

export function ClientDashboard({ data }) {
  const [filter, setFilter] = useState("all");

  return (
    <div>
      <select onChange={e => setFilter(e.target.value)}>
        {/* Interactive filtering */}
      </select>
      {/* Render filtered data */}
    </div>
  );
}
```

**Principe:** Server for data, Client for interactivity.
(Vercel: "Render where it makes sense", React: "Progressive enhancement")

---

## Panels & Layouts (react-resizable-panels)

### Installation shadcn

```bash
npx shadcn@latest add resizable
```

**Crée:** `components/ui/resizable.tsx`

---

### Usage strict

```tsx
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from "@/components/ui/resizable";

export function DashboardLayout({ children }) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {/* Sidebar */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="h-full overflow-hidden p-4">
          <Sidebar />
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Main content */}
      <ResizablePanel defaultSize={80}>
        <div className="h-full overflow-y-auto p-6">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

---

### Règles panels

✅ **defaultSize** sans state local

```tsx
<ResizablePanel defaultSize={30}> // ✅ Correct
```

❌ **PAS de state dimensions**

```tsx
// ❌ INTERDIT
const [size, setSize] = useState(300);
<div style={{ width: size }}>
```

✅ **overflow: hidden obligatoire sur parents**

```tsx
<ResizablePanel defaultSize={50}>
  <div className="h-full overflow-hidden"> {/* ✅ Container */}
    <div className="h-full overflow-y-auto"> {/* ✅ Scrollable content */}
      {/* Content */}
    </div>
  </div>
</ResizablePanel>
```

**Principe:** Let library handle sizing, you handle overflow.

---

## Erreurs Fréquentes & Solutions

### 1. Mauvais imports registry

❌ **Erreur:**

```tsx
import { Button } from "@/registry/default/ui/button";
```

✅ **Correct:**

```tsx
import { Button } from "@/components/ui/button";
```

**Fix:** Vérifier `tsconfig.json` paths (`@/*` défini)

---

### 2. Multiple Tailwind configs

❌ **Erreur:**

```
/tailwind.config.js
/src/tailwind.config.ts  // ❌ Duplication
```

✅ **Correct:** 1 SEUL à la racine

```
/tailwind.config.ts  // ✅ Unique
```

---

### 3. Hydration mismatch

❌ **Erreur:**

```tsx
// Server Component avec state client
export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return <div>{mounted ? "Client" : "Server"}</div>;
  // Error: Text content mismatch
}
```

✅ **Correct:**

```tsx
"use client"; // ✅ Déclarer Client Component

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return <div>{mounted ? "Client" : "Server"}</div>;
}
```

---

### 4. z-index wars

❌ **Erreur:** z-index aléatoires (z-999, z-9999)

✅ **Correct:** Hierarchy stricte

```css
/* Tailwind z-index scale */
Dialog/Modal     → z-50
Dropdown/Popover → z-40
Tooltip          → z-30
Header/Navbar    → z-20
Sticky elements  → z-10
Normal content   → z-0 (ou pas de z-index)
```

**Usage:**

```tsx
<Dialog className="z-50">  {/* ✅ Modal au-dessus */}
<Popover className="z-40"> {/* ✅ Dropdown en dessous modal */}
```

---

## Stack Minimal Propre

### Dependencies recommandées

**Core:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

**UI:**
```json
{
  "dependencies": {
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest", // shadcn dependencies
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

**Optional:**
```json
{
  "dependencies": {
    "react-resizable-panels": "^2.0.0", // Si layouts
    "lucide-react": "^0.300.0",         // Icons
    "date-fns": "^3.0.0"                // Dates
  }
}
```

---

### Interdictions stack

❌ **styled-components** (CSS-in-JS, conflit Tailwind)
❌ **emotion** (CSS-in-JS, conflit Tailwind)
❌ **CSS modules** (fragmentation)
❌ **Material-UI** (conflit shadcn/ui)
❌ **Bootstrap** (conflit Tailwind, paradigme différent)
❌ **jQuery** (anti-pattern React)

**Principe:** Utility-first CSS (Tailwind) + Headless UI (Radix via shadcn).
(Vercel: "Modern stack only", shadcn: "No CSS-in-JS")

---

## Workflow Modifications Fichiers

### AVANT toute modification frontend

**Checklist obligatoire:**

1. ✅ **Vérifier tsconfig paths** (`@/*` configuré?)
2. ✅ **Vérifier imports** (depuis `/components/ui`?)
3. ✅ **Vérifier 1 seul globals.css** (pas de duplication)
4. ✅ **Vérifier "use client"** si hooks/events utilisés
5. ✅ **Vérifier anti-duplication** (composant existe déjà?)

---

### Client Components obligatoires SI

- ✅ `useState`, `useEffect`, `useContext`, hooks React
- ✅ Event handlers (`onClick`, `onChange`, `onSubmit`)
- ✅ Browser APIs (`window`, `document`, `localStorage`)
- ✅ Third-party libs interactives (react-hook-form, etc)

**Format:**

```tsx
"use client"; // ✅ Première ligne, avant imports

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MyComponent() {
  const [state, setState] = useState(false);

  return (
    <Button onClick={() => setState(!state)}>
      {state ? "On" : "Off"}
    </Button>
  );
}
```

---

### Server Components par défaut SI

- ✅ Fetch data (Prisma, API externe)
- ✅ Pas d'interactivité
- ✅ SEO important (landing page, blog posts)
- ✅ Static content

**Format:**

```tsx
// Pas de "use client" = Server Component par défaut

import { prisma } from "@/lib/prisma";

export default async function Page() {
  const data = await prisma.table.findMany();

  return (
    <div>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

---

## Debugging Checklist

### Si composant ne s'affiche pas

1. ✅ **Import correct?** `@/components/ui/...`
2. ✅ **"use client"?** Si hooks/events
3. ✅ **className Tailwind valide?** (typo?)
4. ✅ **Parent avec height définie?** (`h-screen`, `h-full`)

---

### Si styles cassés

1. ✅ **1 seul Tailwind config?** (racine projet)
2. ✅ **globals.css importé?** (root layout)
3. ✅ **Pas de CSS modules?** (conflits)
4. ✅ **z-index hierarchy respectée?** (50 modal, 40 dropdown, etc)

---

### Si hydration error

1. ✅ **Pas de state client dans Server Component?**
2. ✅ **Pas de `window`/`document` sans `useEffect`?**
3. ✅ **Pas de Date/Random dans render initial?**

**Solution:** Ajouter `"use client"` OU déplacer logique dans `useEffect`

```tsx
"use client";

import { useEffect, useState } from "react";

export function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ✅ Après hydration
  }, []);

  if (!mounted) return null; // ✅ Évite hydration mismatch

  return <div>{new Date().toISOString()}</div>;
}
```

---

## Exemple Architecture Complète

### Server Component (data fetching)

```tsx
// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { ClientDashboard } from "./client-dashboard";

export default async function DashboardPage() {
  const tasks = await prisma.task.findMany({
    include: { user: true }
  });

  return <ClientDashboard tasks={tasks} />;
}
```

---

### Client Component (interactivity)

```tsx
// app/dashboard/client-dashboard.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ClientDashboard({ tasks }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const filteredTasks = tasks.filter(task =>
    filter === "all" || task.status === filter
  );

  return (
    <div className="flex h-screen flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => setOpen(true)}>Add Task</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          {/* Form content */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Conventions Non-Negotiables

1. **1 seul globals.css** (Tailwind directives)
2. **Imports shadcn depuis `@/components/ui`** uniquement
3. **Pas de duplication composants** (check avant créer)
4. **"use client" si hooks/events** (hydration safe)
5. **Tailwind uniquement** (pas CSS-in-JS, pas CSS modules)
6. **z-index hierarchy stricte** (50 modal, 40 dropdown, etc)
7. **Server Component par défaut** (Client opt-in)
8. **Paths alias `@/*`** (tsconfig configuré)

**Cette architecture = OBLIGATOIRE. Toute déviation = bug garanti.**

---

**Inspiré de:**
- Vercel DX (Developer Experience best practices)
- shadcn/ui Philosophy (Composition, accessibility, customization)
- Tailwind CSS Utility-First (No CSS-in-JS, utility classes)
- Next.js App Router (Server/Client Components pattern)
- React Best Practices (Composition over inheritance)

---

**Version**: 1.0.0
**Last updated**: 2025-01-10
**Maintained by**: EXECUTOR agent
