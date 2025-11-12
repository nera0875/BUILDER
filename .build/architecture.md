# Architecture - BUILDER

> **Module Dependency Graph** - Définit structure modulaire + dépendances
>
> Utilisé par EXECUTOR pour parallélisation intelligente

---

## Modules Système

### database
- **Path:** `prisma/`, `lib/prisma.ts`
- **Type:** infrastructure
- **Dependencies:** `[]`
- **Exports:** Prisma Client, Database models
- **Description:** Schema Prisma + client configuration

### types
- **Path:** `lib/types/`
- **Type:** shared
- **Dependencies:** `[database]`
- **Exports:** TypeScript type definitions
- **Description:** Types dérivés de Prisma models + custom types

### actions
- **Path:** `app/actions/`
- **Type:** business-logic
- **Dependencies:** `[database, types]`
- **Exports:** Next.js Server Actions
- **Description:** CRUD operations + business logic server-side

### ui-components
- **Path:** `components/features/`
- **Type:** presentation
- **Dependencies:** `[types]`
- **Exports:** React components (client/server)
- **Description:** Composants UI réutilisables (hors shadcn/ui base)

### pages
- **Path:** `app/`
- **Type:** presentation
- **Dependencies:** `[ui-components, actions]`
- **Exports:** Next.js pages (routes)
- **Description:** Pages applicatives avec routing

---

## Règles Modules

### Ajout Nouveau Module

Quand créer nouveau module:
- Groupe cohérent fichiers (>3 fichiers liés)
- Responsabilité isolée (SRP)
- Dépendances claires

**Template:**
```markdown
### module-name
- **Path:** `path/to/module/`
- **Type:** infrastructure|shared|business-logic|presentation
- **Dependencies:** `[other-modules]`
- **Exports:** Description exports
- **Description:** Responsabilité module
```

### Modification Module Existant

Quand modifier:
- Ajout fichiers dans module existant (update Path si pattern change)
- Nouvelle dépendance (update Dependencies)
- Changement responsabilité (update Description)

**Process:**
1. EXECUTOR détecte changement
2. Update architecture.md automatiquement
3. Append timeline.md avec log

---

## Topological Sort

**Ordre exécution (niveaux):**

```
Level 0: database (aucune dépendance)
  ↓
Level 1: types (dépend database)
  ↓
Level 2: actions, ui-components (dépendent types)
  ↓
Level 3: pages (dépend ui-components + actions)
```

**Parallélisation:**
- Niveau 0: 1 agent (database)
- Niveau 1: 1 agent (types)
- Niveau 2: 2 agents parallèles (actions + ui-components indépendants)
- Niveau 3: 1 agent (pages)

**Optimisation:** Modules même niveau = parallélisation maximale

---

## Conventions Paths

**Standards Next.js App Router:**
- Database: `prisma/schema.prisma`, `lib/prisma.ts`
- Types: `lib/types/*.ts`
- Actions: `app/actions/*.ts`
- Components: `components/features/**/*.tsx`
- UI Base: `components/ui/**/*.tsx` (shadcn - READ-ONLY)
- Pages: `app/**/page.tsx`
- Layouts: `app/**/layout.tsx`

**Imports aliases:**
- `@/lib/*` → library code
- `@/components/*` → composants
- `@/app/*` → pages/actions

---

## État Actuel

- **Modules définis:** 5 (database, types, actions, ui-components, pages)
- **Dernière mise à jour:** 2025-01-12
- **Projets utilisant:** 0

---

## Notes

- Fichier maintenu par EXECUTOR automatiquement
- Lecture par ORCHESTRATOR pour parallélisation
- Ne pas modifier manuellement sauf ajout modules custom
