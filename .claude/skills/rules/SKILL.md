---
name: rules
description: Strict file creation rules. Loaded FIRST by orchestrator and all agents before any action. Prevents pollution with .md, .json, scripts. Only allows code files and .build/ docs.
allowed-tools: None
---

# Rules Skill - Règles Strictes Fichiers

> **Chargé EN PREMIER par orchestrator + tous agents AVANT toute action**

---

## ❌ INTERDIT de créer

### Fichiers Documentation
- `.md` SAUF `.build/*.md` (context, timeline, tasks, issues)
- `.md` SAUF `.build/decisions/*.md` (ADRs uniquement)
- README, GUIDE, ARCHITECTURE, WORKFLOW fichiers hasardeux
- Documentation dispersée hors `.build/`

### Fichiers Configuration Non-Standards
- `.json` SAUF package.json, tsconfig.json, components.json (standards projet)
- `.yaml/.yml` SAUF docker-compose.yml, .github/workflows/ (CI/CD standards)
- Fichiers config custom hasardeux

### Scripts Hasardeux
- `.sh` scripts inutiles (sauf si explicitement demandé user)
- Setup scripts pollués

---

## ✅ AUTORISÉ uniquement

### Code Source
- `.tsx, .ts, .jsx, .js` (React/TypeScript/JavaScript)
- `.py` (Python)
- `.css, .scss` (Styles - préférer Tailwind dans globals.css)
- `.prisma` (Prisma schema)
- `.sql` (Migrations SQL si besoin)

### Configuration Standards
- `package.json` (Node.js dependencies)
- `tsconfig.json` (TypeScript config)
- `tailwind.config.ts` (Tailwind config)
- `next.config.ts` (Next.js config)
- `components.json` (shadcn config)
- `.env, .env.local, .env.example` (Environment variables)
- `prisma/schema.prisma` (Database schema)

### Documentation Centralisée (.build/ uniquement)
- `.build/context.md` (état projet)
- `.build/timeline.md` (historique)
- `.build/tasks.md` (tâches)
- `.build/issues.md` (bugs/solutions)
- `.build/decisions/*.md` (ADRs numérotés: 000-xxx.md, 001-xxx.md)

---

## 🔍 Vérification OBLIGATOIRE

**AVANT Write/Edit fichier:**

```
1. Check si path autorisé selon règles ci-dessus
2. SI path NON autorisé:
   - STOP immédiatement
   - Demander user: "Création [FICHIER] non-standard. Confirmes?"
3. SI user confirme: Procéder
4. SI user refuse: Abandonner
```

**Exemple vérification:**
```
User: "Crée dashboard"
Agent: Va créer app/dashboard/page.tsx
Check: .tsx → ✅ Autorisé (code source)
→ Procéder

User: "Crée feature"
Agent: Va créer FEATURE-GUIDE.md
Check: .md hors .build/ → ❌ Interdit
→ STOP + demander user
```

---

## 📁 Structure Fichiers Autorisée

### Projet Frontend (Next.js)
```
projet/
├── .build/              # Documentation centralisée (SEUL endroit .md)
│   ├── context.md
│   ├── timeline.md
│   ├── tasks.md
│   ├── issues.md
│   └── decisions/
│       └── 000-xxx.md
├── app/                 # Next.js pages
├── components/          # React components
├── lib/                 # Utilities
├── prisma/              # Database schema
├── public/              # Static assets
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── tailwind.config.ts   # Tailwind config
```

### Projet Backend (Python)
```
backend/
├── .build/              # Documentation centralisée
├── api/                 # FastAPI routes
├── services/            # Business logic
├── models/              # Database models
├── config.py            # Configuration (1 seul fichier)
├── requirements.txt     # Dependencies
└── .env                 # Environment variables
```

### Projet Full-Stack (Next.js + Prisma)
```
projet/
├── .build/              # Documentation centralisée
├── app/                 # Next.js (frontend + Server Actions)
├── components/          # React components
├── prisma/              # Database schema + migrations
├── lib/                 # Utilities + Prisma client
└── package.json
```

---

## 🚫 Exemples Interdictions

### ❌ Fichiers à NE JAMAIS créer:
```
README.md                    # Sauf si user demande explicitement
ARCHITECTURE.md
WORKFLOW.md
GUIDE.md
SETUP.md
setup-project.sh
install.sh
deploy.sh                    # Sauf si deployment script demandé
test-matrix.md               # Pollution
capabilities-guide.md        # Pollution
system-architecture.md       # Pollution
custom-config.json           # Non-standard
```

### ✅ Fichiers autorisés:
```
.build/context.md            # Documentation projet
.build/decisions/001-use-prisma.md  # ADR
app/dashboard/page.tsx       # Code
components/ui/button.tsx     # Code
lib/utils.ts                 # Code
prisma/schema.prisma         # Config standard
package.json                 # Config standard
```

---

## 🎯 Responsabilités

### Orchestrator (Claude principal)
- ✅ Créer/modifier `.build/*.md`
- ✅ Créer ADRs `.build/decisions/*.md`
- ❌ Créer autres fichiers .md

### Agents (executor, researcher, tester)
- ✅ Créer code source (.tsx, .ts, .py, etc)
- ✅ Créer configs standards (si nécessaire)
- ❌ Créer fichiers .md (jamais, même dans .build/)
- ❌ Créer documentation

### Skills
- Définissent conventions code
- Pas de création fichiers documentation
- Focus: patterns + anti-duplication

---

## ⚠️ Exceptions (validation user requise)

**SI user demande explicitement:**
- README.md projet
- Documentation technique spécifique
- Scripts deployment custom
- Configuration non-standard

**Workflow:**
```
User: "Crée README projet"
Agent: "Création README.md (hors règles standards). Confirmes?"
User: "oui" → Agent crée
```

---

## 📌 Résumé Règle d'Or

**1 SEUL endroit documentation: `.build/`**
**Tout le reste: CODE SOURCE uniquement**

Si doute sur fichier → **Demander user AVANT créer**

---

**Version:** 1.0.0
**Date:** 2025-01-10
**Application:** Obligatoire pour orchestrator + tous agents + tous skills
