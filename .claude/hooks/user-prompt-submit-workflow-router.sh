#!/bin/bash
# UserPromptSubmit Hook: Workflow Router
# Détecte type requête → Inject workflow strict exact

INPUT=$(cat)

# Extract prompt from JSON (pure bash, no jq dependency)
PROMPT=$(echo "$INPUT" | grep -o '"prompt"\s*:\s*"[^"]*"' | cut -d'"' -f4)

# Skip si prompt vide
if [ -z "$PROMPT" ]; then
  exit 0
fi

# ════════════════════════════════════════════
# PATTERN 1: NOUVEAU PROJET
# ════════════════════════════════════════════

if [[ "$PROMPT" =~ (crée projet|nouveau projet|new project|créer projet) ]]; then
  cat <<'EOF'
{
  "additionalContext": "⚠️ WORKFLOW DÉTECTÉ: NOUVEAU PROJET

ÉTAPES OBLIGATOIRES (NON-NÉGOCIABLES):

1. AskUserQuestion (Features + Stack + Database)
2. /consult [project analysis] (EXECUTOR analyse)
3. display-plan (User validation REQUIRED)
4. Task(executor, MODE: EXECUTE vagues)
5. /validate-system (TypeScript + Prisma + Build)
6. skill(deployment) (PM2 + Preview URL)
7. skill(git) (Auto-commit initial)

❌ INTERDICTIONS ABSOLUES:
- Skip questions user
- Coder sans CONSULT
- Créer >5 fichiers sans vagues
- Oublier validation TypeScript
- Deploy sans tests

⚠️ TU DOIS SUIVRE CES 7 ÉTAPES EXACTEMENT.
JE SURVEILLE. ZÉRO LIBERTÉ."
}
EOF
  exit 0
fi

# ════════════════════════════════════════════
# PATTERN 2: AJOUTE FEATURE
# ════════════════════════════════════════════

if [[ "$PROMPT" =~ (ajoute|crée|implémente|nouveau|nouvelle).*(feature|composant|component|page|route|api) ]]; then
  cat <<'EOF'
{
  "additionalContext": "⚠️ WORKFLOW DÉTECTÉ: NOUVELLE FEATURE

ÉTAPES OBLIGATOIRES:

1. Read .build/context.md + .build/inventory.md (CHECK -2 FORCÉ)
2. /consult [feature description] (EXECUTOR analyse + anti-dup)
3. Valide plan avec user (attends confirmation)
4. Task(executor, MODE: EXECUTE selon plan)
5. /validate-system (CRITIQUE - 0 errors requis)
6. skill(testing) si feature UI
7. skill(git) commit feature

❌ BLOCAGES AUTOMATIQUES:
- Edit/Write sans CONSULT → Hook pre-tool-use bloque
- TypeScript errors → Hook post-tool-use auto-revert
- Duplicate component → Anti-dup bloque

⚠️ COMMENCE PAR: Read .build/context.md
PAS DE NÉGOCIATION."
}
EOF
  exit 0
fi

# ════════════════════════════════════════════
# PATTERN 3: FIX BUG
# ════════════════════════════════════════════

if [[ "$PROMPT" =~ (fix|corrige|répare|bug|erreur|error|problème|crash) ]]; then
  cat <<'EOF'
{
  "additionalContext": "⚠️ WORKFLOW DÉTECTÉ: BUG FIX

ÉTAPES OBLIGATOIRES:

1. Read .build/issues.md (check solutions existantes)
2. Diagnostic (Grep codebase + Read fichier concerné)
3. /consult fix [description bug exact]
4. Task(executor, MODE: EXECUTE fix)
5. /validate-system (CRITIQUE - verify fix works)
6. skill(testing) reproduction + verify fixed
7. Append .build/issues.md (documenter solution)
8. skill(git) commit fix

⚠️ PRIORITÉ ABSOLUE:
- TypeScript 0 errors AVANT commit
- Testing obligatoire (reproduction)
- Documentation .build/issues.md

ZÉRO TOLÉRANCE ERREURS."
}
EOF
  exit 0
fi

# ════════════════════════════════════════════
# PATTERN 4: MODIFIE EXISTANT
# ════════════════════════════════════════════

if [[ "$PROMPT" =~ (modifie|change|update|refactor|améliore) ]]; then
  cat <<'EOF'
{
  "additionalContext": "⚠️ WORKFLOW DÉTECTÉ: MODIFICATION CODE EXISTANT

ÉTAPES OBLIGATOIRES:

1. Read .build/context.md (état actuel projet)
2. Read fichier(s) concerné(s)
3. /consult modification [description exacte]
4. Task(executor, MODE: EXECUTE)
5. /validate-system (validation critique)
6. skill(testing) verify no regression
7. skill(git) commit modification

⚠️ ATTENTION MODIFICATIONS:
- Check impact autres composants (dependencies)
- TypeScript validation CRITIQUE
- Anti-duplication obligatoire
- Tests régression si UI

PRUDENCE MAXIMALE."
}
EOF
  exit 0
fi

# ════════════════════════════════════════════
# FALLBACK: Pas de workflow spécifique
# ════════════════════════════════════════════

exit 0
