#!/bin/bash

# Builder System - Pre-push Check
# Vérifie que tout est prêt pour push GitHub

echo "🔍 Vérification BUILDER prêt pour push GitHub..."
echo ""

# Check structure
echo "📁 Structure dossiers:"
ERRORS=0

check_dir() {
  if [ -d "$1" ]; then
    echo "  ✅ $1"
  else
    echo "  ❌ $1 (MANQUANT)"
    ((ERRORS++))
  fi
}

check_file() {
  if [ -f "$1" ]; then
    echo "  ✅ $1"
  else
    echo "  ❌ $1 (MANQUANT)"
    ((ERRORS++))
  fi
}

check_dir ".claude"
check_dir ".claude/agents"
check_dir ".claude/skills"
check_dir ".build"
check_dir ".build/templates"
check_dir ".build/decisions"
check_dir ".stack"
check_dir ".stack/components"
check_dir ".stack/components/ui"
check_dir ".stack/app"
check_dir ".stack/lib"

echo ""
echo "📄 Fichiers essentiels:"
check_file "CLAUDE.md"
check_file "README.md"
check_file "CHANGELOG.md"
check_file ".gitignore"
check_file ".stack/package.json"
check_file ".stack/components.json"
check_file ".stack/tsconfig.json"

echo ""
echo "🎨 Composants shadcn (.stack/components/ui/):"
UI_COUNT=$(find .stack/components/ui -name "*.tsx" 2>/dev/null | wc -l)
if [ "$UI_COUNT" -ge 50 ]; then
  echo "  ✅ $UI_COUNT composants (>= 50 OK)"
else
  echo "  ⚠️  $UI_COUNT composants (attendu >= 50)"
  ((ERRORS++))
fi

echo ""
echo "🔒 Vérification .gitignore:"
if grep -q ".mcp.json" .gitignore; then
  echo "  ✅ .mcp.json ignoré"
else
  echo "  ⚠️  .mcp.json pas dans .gitignore (recommandé)"
fi

echo ""
echo "📝 Vérification skills (chemins relatifs):"
if grep -r "/home/pilote" .claude/ >/dev/null 2>&1; then
  echo "  ⚠️  Chemins absolus trouvés dans .claude/ (à corriger)"
  grep -r "/home/pilote" .claude/ 2>/dev/null | head -5
  ((ERRORS++))
else
  echo "  ✅ Aucun chemin absolu dans .claude/"
fi

if grep -r "BUILDER-FRONTEND-BASE" .claude/ >/dev/null 2>&1; then
  echo "  ⚠️  Références BUILDER-FRONTEND-BASE trouvées (devrait être BUILDER/.stack/)"
  grep -r "BUILDER-FRONTEND-BASE" .claude/ 2>/dev/null | head -5
  ((ERRORS++))
else
  echo "  ✅ Aucune référence BUILDER-FRONTEND-BASE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo "✅ TOUT EST PRÊT POUR PUSH GITHUB!"
  echo ""
  echo "Commandes à exécuter:"
  echo ""
  echo "  git init"
  echo "  git add ."
  echo "  git commit -m 'feat: Initial Builder System v1.1.0"
  echo ""
  echo "  - Base frontend dans .stack/ (57 composants shadcn)"
  echo "  - Agents + skills (executor, researcher, tester)"
  echo "  - Templates .build/ documentation"
  echo "  - Orchestrator CLAUDE.md"
  echo "  - README + CHANGELOG'"
  echo ""
  echo "  git remote add origin https://github.com/USER/BUILDER.git"
  echo "  git branch -M main"
  echo "  git push -u origin main"
  echo ""
else
  echo "❌ $ERRORS erreur(s) détectée(s)"
  echo ""
  echo "Corrige les erreurs ci-dessus avant push."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
