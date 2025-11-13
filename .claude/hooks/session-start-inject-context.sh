#!/bin/bash
# SessionStart Hook: Auto-Load Project Context
# Load .build/ au démarrage session → Claude connaît projet instantly

INPUT=$(cat)

# Check si projet BUILDER avec .build/
if [ ! -d "$CLAUDE_PROJECT_DIR/.build" ]; then
  # Pas de .build/ → Skip
  exit 0
fi

# ════════════════════════════════════════════
# LOAD CONTEXT FILES
# ════════════════════════════════════════════

CONTEXT_FILE="$CLAUDE_PROJECT_DIR/.build/context.md"
INVENTORY_FILE="$CLAUDE_PROJECT_DIR/.build/inventory.md"
TASKS_FILE="$CLAUDE_PROJECT_DIR/.build/tasks.md"
ISSUES_FILE="$CLAUDE_PROJECT_DIR/.build/issues.md"

CONTEXT_CONTENT="No context available"
INVENTORY_CONTENT="No inventory available"
TASKS_CONTENT="No tasks tracked"
ISSUES_CONTENT="No known issues"

if [ -f "$CONTEXT_FILE" ]; then
  CONTEXT_CONTENT=$(cat "$CONTEXT_FILE")
fi

if [ -f "$INVENTORY_FILE" ]; then
  INVENTORY_CONTENT=$(head -50 "$INVENTORY_FILE")  # Limit to 50 lines
fi

if [ -f "$TASKS_FILE" ]; then
  TASKS_CONTENT=$(cat "$TASKS_FILE")
fi

if [ -f "$ISSUES_FILE" ]; then
  ISSUES_CONTENT=$(head -30 "$ISSUES_FILE")  # Last 30 lines
fi

# ════════════════════════════════════════════
# INJECT CONTEXT + RÈGLES
# ════════════════════════════════════════════

cat <<EOF
{
  "additionalContext": "# 🏗️ PROJECT CONTEXT AUTO-LOADED

## Stack & Current State
$CONTEXT_CONTENT

---

## Code Inventory (Anti-Duplication Check)
$INVENTORY_CONTENT

---

## Tasks Status
$TASKS_CONTENT

---

## Known Issues & Solutions
$ISSUES_CONTENT

---

# ⚠️ RÈGLES SESSION (NON-NÉGOCIABLES)

## Workflow Enforcement

1. **CHECK -2 DONE**: Tu connais déjà .build/ (ci-dessus chargé)
2. **CHECK -1 FORCÉ**: /consult OBLIGATOIRE avant coder
3. **User input → Hook router**: Workflow strict auto-injecté
4. **Edit/Write → Validation**: Auto TypeCheck + revert si erreur
5. **ZÉRO LIBERTÉ**: Tu suis workflow rigide, pas de décisions

## Hooks Actifs

- ✅ user-prompt-submit-workflow-router.sh (détecte intent → inject workflow)
- ✅ pre-tool-use-strict-validation.sh (valide + auto-correct tools)
- ✅ check-consult-before-code.sh (bloque Edit/Write sans CONSULT)
- ✅ post-tool-use-auto-validate.sh (TypeCheck auto + revert)
- ✅ session-start-inject-context.sh (ce hook - context loaded)

## Commands Disponibles

- \`/consult [description]\` - Force MODE: CONSULT workflow
- \`/validate-system\` - TypeScript + Prisma + Build checks
- \`/new-project [name]\` - Création projet workflow scellé
- \`/add-feature [desc]\` - Feature workflow strict

---

# 🤖 TON RÔLE

Tu es un **ROBOT D'EXÉCUTION**.

- User dit QUOI
- Hooks disent COMMENT
- Tu EXÉCUTES bêtement

**ZÉRO IMPROVISATION. ZÉRO DÉCISION. ZÉRO OUBLI.**

Le système est SCELLÉ. Tu es CADRÉ.

Commence session."
}
EOF
