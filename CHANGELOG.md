# Changelog - Builder System

## Version 1.1.0 - 2025-11-11

### 🎯 Restructuration Majeure

**BUILDER-FRONTEND-BASE déplacé dans `.stack/`**

Ancienne structure:
```
/home/pilote/projet/primaire/
├── BUILDER/
│   ├── .claude/
│   ├── .build/
│   └── CLAUDE.md
└── BUILDER-FRONTEND-BASE/  ← Séparé
```

Nouvelle structure:
```
BUILDER/
├── .claude/         ← Agents + skills
├── .build/          ← Templates documentation
├── .stack/          ← Frontend base (ex-BUILDER-FRONTEND-BASE)
│   ├── components/ui/  (57 composants shadcn)
│   ├── app/
│   ├── lib/
│   └── configs
├── .mcp.json
└── CLAUDE.md
```

### ✅ Modifications Appliquées

**1. Frontend Skill (`/home/pilote/.claude/skills/frontend/SKILL.md`)**
- ✅ Remplacé tous les chemins `/home/pilote/projet/primaire/BUILDER-FRONTEND-BASE/` par `BUILDER/.stack/`
- ✅ Ajouté détection automatique path BUILDER (via `find ~ -type d -name "BUILDER"`)
- ✅ Workflow clone mis à jour pour utiliser `.stack/`
- ✅ Toutes références "BUILDER-FRONTEND-BASE" remplacées par "BUILDER/.stack/"

**2. CLAUDE.md**
- ✅ Aucune modification nécessaire (pas de référence directe à la base frontend)

**3. Autres Skills**
- ✅ Aucune référence absolue détectée

### 📦 Contenu `.stack/`

**57 composants shadcn/ui:**
- Forms (9): checkbox, form, input, input-otp, label, radio-group, select, slider, switch, textarea
- Data Display (8): avatar, badge, calendar, card, progress, skeleton, table, chart
- Feedback (10): alert, alert-dialog, dialog, drawer, hover-card, popover, sheet, toast, tooltip, sonner
- Navigation (7): breadcrumb, dropdown-menu, menubar, navigation-menu, pagination, tabs, command
- Layout (6): accordion, aspect-ratio, collapsible, resizable, scroll-area, separator
- Buttons (3): button, toggle, toggle-group
- Advanced (14+): carousel, context-menu, date-picker, combobox, etc.

**Configs:**
- `components.json` - Configuration shadcn
- `tsconfig.json` - TypeScript strict
- `next.config.ts` - Next.js 16
- `postcss.config.mjs` - PostCSS + Tailwind v4
- `package.json` - Dependencies optimisées

**Styles:**
- `app/globals.css` - Tailwind v4 + shadcn variables
- `app/themes.css` - Dark mode support

**Libs:**
- `lib/utils.ts` - Helper cn() pour class merging
- `lib/compose-refs.ts` - Radix helper

### 🚀 Workflow User Nouveau Projet

**1. Clone depot BUILDER (une seule fois):**
```bash
git clone https://github.com/user/BUILDER ~/tools/BUILDER
```

**2. Créer nouveau projet:**
```bash
cd ~/projects/mon-nouveau-projet
# Claude détecte automatiquement BUILDER/.stack/ et clone
```

**3. Claude clone automatiquement:**
```bash
# Détection auto BUILDER
BUILDER_STACK=$(find ~ -type d -name "BUILDER" 2>/dev/null | head -1)/.stack

# Clone base
cp -r "$BUILDER_STACK"/* ./
npm install
```

### 📋 Prochaines Étapes

**Avant push GitHub:**
1. ✅ Vérifier `.gitignore` inclut `.mcp.json` si nécessaire
2. ✅ Créer README.md racine avec workflow user
3. ✅ Tester clone depuis GitHub sur nouveau projet

**Commandes push:**
```bash
cd /home/pilote/projet/primaire/BUILDER

# Init repo si pas déjà fait
git init
git add .
git commit -m "refactor: Move BUILDER-FRONTEND-BASE to .stack/

- Déplace base frontend dans BUILDER/.stack/
- Update frontend skill pour chemins relatifs
- Détection automatique path BUILDER
- Prêt pour clone GitHub"

# Push vers GitHub
git remote add origin https://github.com/user/BUILDER.git
git branch -M main
git push -u origin main
```

### 🔧 Technical Details

**Détection automatique BUILDER/.stack/:**
- Cherche dossier BUILDER/ en remontant arborescence
- Fallback: `find ~ -type d -name "BUILDER"`
- Path par défaut: `../../BUILDER/.stack/` (depuis projet)

**Anti-duplication:**
- 57 composants shadcn pré-installés
- Check automatique avant `npx shadcn add`
- Réutilisation obligatoire si existe

**Principe:**
> "Clone repo BUILDER une fois, utilise pour tous projets"

---

**Maintenu par:** Builder System
**Version:** 1.1.0
**Date:** 2025-11-11
