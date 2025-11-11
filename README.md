# Builder System

> **Système autonome pour builder n'importe quel projet full-stack**
>
> Next.js + React + shadcn/ui + Prisma + FastAPI

---

## 🎯 Concept

**Builder = Lego System pour projets web**

1. Clone ce repo **une seule fois**
2. Crée n'importe quel projet (dashboard, SaaS, app)
3. Builder détecte stack automatiquement
4. Clone base frontend depuis `.stack/`
5. Setup backend si nécessaire
6. Projet prêt en quelques minutes

---

## 📦 Contenu Repo

```
BUILDER/
├── .claude/              # Agents (executor, researcher, tester)
│   ├── agents/
│   └── skills/           # Frontend + Backend conventions
├── .build/               # Templates documentation
│   ├── context.md
│   ├── tasks.md
│   ├── issues.md
│   └── templates/
├── .stack/               # Base Lego Frontend
│   ├── components/ui/    # 57 composants shadcn
│   ├── app/              # globals.css + themes.css
│   ├── lib/              # utils.ts
│   └── configs/          # tsconfig, next.config, etc
├── CLAUDE.md             # Orchestrator prompt principal
└── README.md             # Ce fichier
```

---

## 🚀 Installation

### 1. Clone BUILDER (une seule fois)

```bash
# Clone dans un dossier tools ou où tu veux
git clone https://github.com/user/BUILDER.git ~/tools/BUILDER
```

### 2. Utilisation dans nouveau projet

```bash
# Créer nouveau projet
mkdir ~/projects/mon-dashboard
cd ~/projects/mon-dashboard

# Lancer Claude avec BUILDER
# Claude détecte automatiquement ~/tools/BUILDER/.stack/
# et clone la base frontend
```

---

## 💡 Exemples Projets

### Exemple 1: Dashboard TickTick Clone

**User:**
> "Crée dashboard gestion tâches style TickTick avec kanban + pomodoro + sidebar"

**Builder fait:**
1. ✅ Détecte nouveau projet
2. ✅ Clone `.stack/` (57 composants shadcn ready)
3. ✅ Crée `.build/` (context, tasks, specs)
4. ✅ Setup Prisma + PostgreSQL (schema Task)
5. ✅ Crée components custom (Kanban, Pomodoro, Sidebar)
6. ✅ Tests E2E automatiques
7. ✅ Documente dans timeline.md

**Résultat:**
```
mon-dashboard/
├── .build/
│   ├── context.md       # Stack détectée
│   ├── specs.md         # Features roadmap
│   └── timeline.md      # Historique
├── app/
│   ├── globals.css      # DE .stack/
│   ├── themes.css       # DE .stack/
│   └── dashboard/
│       ├── layout.tsx   # ResizablePanel + Sidebar
│       └── page.tsx     # Server Component
├── components/
│   ├── ui/              # 57 composants DE .stack/
│   ├── layout/
│   │   └── sidebar.tsx
│   └── features/
│       ├── kanban/
│       ├── pomodoro/
│       └── tasks/
├── prisma/
│   └── schema.prisma
└── package.json
```

### Exemple 2: Landing Page SaaS

**User:**
> "Landing page SaaS moderne avec pricing + CTA + dark mode"

**Builder fait:**
1. ✅ Clone `.stack/` (composants ready)
2. ✅ Crée page landing (Server Component SEO)
3. ✅ Sections: Hero, Features, Pricing, CTA
4. ✅ Dark mode (déjà configuré dans themes.css)
5. ✅ Responsive (Tailwind breakpoints)

---

## 🛠 Stack Technique

### Frontend (`.stack/`)

**Core:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5.8
- Tailwind CSS v4

**UI:**
- shadcn/ui (57 composants)
- Radix UI (primitives)
- Lucide React (icons)
- Tailwind Animate

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

### Backend (templates dans `.build/`)

**Python:**
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

**Node.js:**
- Prisma ORM
- PostgreSQL
- tRPC (optionnel)

---

## 📋 Composants shadcn/ui Inclus

**57 composants prêts à l'emploi dans `.stack/components/ui/`:**

- **Forms (9):** checkbox, form, input, input-otp, label, radio-group, select, slider, switch, textarea
- **Data Display (8):** avatar, badge, calendar, card, progress, skeleton, table, chart
- **Feedback (10):** alert, alert-dialog, dialog, drawer, hover-card, popover, sheet, toast, tooltip, sonner
- **Navigation (7):** breadcrumb, dropdown-menu, menubar, navigation-menu, pagination, tabs, command
- **Layout (6):** accordion, aspect-ratio, collapsible, resizable, scroll-area, separator
- **Buttons (3):** button, toggle, toggle-group
- **Advanced (14+):** carousel, context-menu, date-picker, combobox, etc.

**Principe:** Réutilisation. Jamais recréer composant si existe.

---

## 🎨 Conventions Strictes

### Frontend

1. ✅ **1 seul globals.css** (Tailwind directives)
2. ✅ **Imports depuis @/components/ui** uniquement
3. ✅ **Pas de duplication composants** (check avant créer)
4. ✅ **Server Components par défaut** (Client si hooks)
5. ✅ **Tailwind uniquement** (pas CSS-in-JS, pas modules)

### Backend

1. ✅ **Prisma pour ORM** (PostgreSQL par défaut)
2. ✅ **1 seul singleton Prisma** (lib/prisma.ts)
3. ✅ **Zod pour validation** (schemas dans lib/validators/)
4. ✅ **API routes Next.js** (app/api/)

---

## 📖 Documentation Auto

**Builder crée automatiquement `.build/` dans chaque projet:**

- **context.md** - État actuel projet (stack, composants, conventions)
- **specs.md** - Vision + roadmap + models (pattern Trae Builder)
- **timeline.md** - Historique features/bugfixes
- **tasks.md** - Tâches en cours (Kanban: In Progress, Blocked, Next Up)
- **issues.md** - Bugs + solutions documentées
- **decisions/** - ADRs (Architecture Decision Records)

---

## 🔧 Architecture Agents

### Orchestrator (CLAUDE.md)

**Rôle:** Chef d'orchestre
- Analyse demande user
- Détecte stack nécessaire
- Invoque agents appropriés
- Documente dans `.build/`

### Executor Agent

**Rôle:** Exécution code
- Skills: frontend.md + backend.md
- Anti-duplication check
- Crée composants/routes
- Respecte conventions strictes

### Research Agent

**Rôle:** Recherche docs
- Exa (exemples code production)
- Context7 (docs officielles à jour)
- WebSearch (comparaisons)

### Tester Agent

**Rôle:** Tests E2E
- Chrome DevTools
- Tests automatiques post-feature
- Détection bugs
- Screenshots/snapshots

---

## 🚦 Workflow Type

```
User: "Dashboard avec auth + stats + dark mode"

↓

Orchestrator:
1. Load skill("rules")             # Règles création fichiers
2. Read .build/context.md          # État projet (si existe)
3. Détecte: Nouveau projet
4. Crée .build/ structure

↓

Orchestrator:
5. Détecte stack: Next.js + Prisma
6. Invoque Research (docs Next.js 16 + Prisma)

↓

Executor (skill frontend + backend):
7. Clone BUILDER/.stack/ (base frontend)
8. Crée Prisma schema (User, Session)
9. Crée API routes (auth)
10. Crée components (Dashboard, Stats, ThemeToggle)

↓

Tester:
11. Tests E2E (login, logout, stats affichage)
12. Screenshots validation

↓

Orchestrator:
13. Update .build/context.md
14. Append .build/timeline.md
15. ✓ Confirmation user
```

---

## 📚 Références

- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js 16](https://nextjs.org/)
- [Tailwind v4](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Radix UI](https://www.radix-ui.com/)

---

## 🤝 Contribution

**Workflow contribution:**

1. Fork ce repo
2. Crée branch feature (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 License

MIT License - Open source

---

## 📞 Support

**Issues:** [GitHub Issues](https://github.com/user/BUILDER/issues)

**Questions:** Ouvrir une discussion GitHub

---

**Maintenu par:** Builder System
**Version:** 1.1.0
**Dernière mise à jour:** 2025-11-11

**Built with ❤️ using Claude Code**
