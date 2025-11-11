# Builder System

> **Système autonome pour développer n'importe quel projet frontend/backend**
>
> Basé sur standards industry : Google SRE, Netflix Architecture, Vercel DX, Stripe API Design

---

## Architecture

### Orchestrator (Claude en mode principal)
- Lit `.build/` pour comprendre état projet
- Détecte automatiquement type action (simple, complexe, architecture, bug)
- Invoque agents appropriés selon contexte
- Documente décisions (ADRs) et historique (timeline)

### Agents Spécialisés

**executor** (model: haiku)
- Skills: `frontend` (toujours) + `backend` OU `backend-nodejs` (selon détection) + `integration` (si full-stack)
- Détecte automatiquement type backend (Python vs Node.js)
- Crée/modifie code avec anti-duplication stricte
- Respecte conventions selon skills chargés
- Tools: Read, Write, Edit, Bash, Glob, Grep, Skill

**researcher** (model: haiku)
- Skill: `research`
- Trouve docs officielles (Context7) + exemples production (Exa)
- Comparaisons technologies
- Tools: Exa MCP, Context7 MCP, WebSearch

**tester** (model: haiku)
- Skill: `testing`
- Tests E2E Chrome DevTools
- Workflow strict: navigate → snapshot → interact → debug
- Tools: Chrome DevTools MCP

---

## Workflow Automatique

### Feature Simple (1-2 fichiers)
```
User: "Ajoute bouton X"
↓
Orchestrator → executor (frontend skill)
↓
executor: Anti-duplication check + Create
↓
Confirmation user
```

### Feature Complexe (>= 3 fichiers)
```
User: "Dashboard avec stats API"
↓
Orchestrator détecte: complexe
↓
1. researcher: Docs Next.js + FastAPI (si nouveau)
2. executor: Backend API (/api/stats)
3. executor: Frontend UI (dashboard page)
4. tester: E2E tests automatiques
↓
Orchestrator update .build/ + ADR si décision archi
```

### Décision Architecture
```
User: "PostgreSQL ou MongoDB?"
↓
Orchestrator → researcher
↓
researcher: Exa + Context7 + Web (parallèle)
↓
Orchestrator propose recommandation
↓
User valide
↓
Orchestrator crée ADR (.build/decisions/)
```

---

## Structure `.build/`

```
.build/
├── context.md          # État actuel (stack, structure, composants)
├── timeline.md         # Historique chronologique complet
├── tasks.md            # Tâches (In Progress, Blocked, Next Up)
├── issues.md           # Bugs connus + solutions
├── decisions/          # ADRs (Architecture Decision Records)
│   └── 000-use-adr.md
└── templates/
    └── adr-template.md
```

**Living Documentation** - Mis à jour automatiquement par orchestrator

---

## Skills Conventions

### frontend (toujours chargé)
- Next.js 16 + React 18 + shadcn/ui + Tailwind
- 1 seul globals.css (Tailwind directives)
- Imports shadcn depuis `@/components/ui`
- Server Components par défaut, "use client" si hooks
- Anti-duplication composants

### backend (chargé si projet Python détecté)
- Python FastAPI + conventions strictes
- 1 seul config.py (12-Factor App)
- Services singleton pattern
- snake_case fonctions, PascalCase classes
- Error handling obligatoire

### backend-nodejs (chargé si projet Node.js détecté)
- Node.js/TypeScript + Express/Fastify + Prisma
- 1 seul env.ts (Zod validation config)
- Prisma client singleton (lib/prisma.ts)
- Services singleton pattern
- camelCase fonctions, PascalCase classes
- Error handling middleware

### integration (chargé si feature full-stack)
- Path A: Python FastAPI + React (Pydantic ↔ Zod sync)
- Path B: Next.js + Prisma (Server Actions native)
- Type-safe contracts, error handling, loading states

### research
- Exa AI (exemples production)
- Context7 (docs officielles)
- Recherches parallèles optimisées

### testing
- Chrome DevTools E2E
- Workflow: list_pages → navigate → snapshot → interact → debug
- Pas evaluate_script pour interactions

---

## Usage

### Développer feature
```
User: "Crée dashboard avec stats"

Orchestrator:
1. Lit .build/context.md (état projet)
2. Détecte: feature complexe
3. Invoque researcher (si besoin docs)
4. Invoque executor (backend + frontend)
5. Invoque tester (E2E validation)
6. Update .build/ (timeline, context)
7. Confirme: "✓ Dashboard créé"
```

### Choix technologique
```
User: "Quelle lib state management?"

Orchestrator:
1. Invoque researcher
2. Analyse: Zustand vs Redux vs Context API
3. Propose recommandation basée recherche
4. User valide
5. Crée ADR (.build/decisions/001-state-management.md)
```

### Fix bug
```
User: "Erreur hydration dashboard"

Orchestrator:
1. Lit .build/issues.md (solution existe?)
2. SI oui: Applique solution documentée
3. SI non: executor débug + fix
4. tester valide fix
5. Update .build/issues.md (solution documentée)
```

---

## Principes

1. **Context is King** - Toujours lire `.build/` avant agir
2. **DRY** - Réutiliser avant créer (anti-duplication stricte)
3. **Document Decisions** - ADRs pour choix architecture
4. **Test What You Build** - E2E auto après features
5. **Fail Fast, Learn Faster** - Bugs documentés = learning
6. **Bias for Action** - Décider et exécuter
7. **User Validates, I Execute** - Orchestrator décide, user approuve

---

## Agents Tools Access

| Agent | Skills | MCP Tools | Model |
|-------|--------|-----------|-------|
| executor | frontend, backend | - | haiku |
| researcher | research | Exa, Context7 | haiku |
| tester | testing | Chrome DevTools | haiku |

---

**Inspiré de:** Amazon Leadership Principles, Google SRE, Netflix Culture, Stripe API Philosophy, Vercel DX

**Version**: 1.0.0
**Date**: 2025-01-10
