---
description: Add feature with ENFORCED workflow (anti-bugs)
argument-hint: [feature description]
---

# Add Feature - Workflow Strict

Feature: **$ARGUMENTS**

---

## ⚠️ WORKFLOW OBLIGATOIRE (7 Steps)

### STEP 1: CHECK -2 FORCÉ

Reading project context...

!`cat .build/context.md 2>/dev/null || echo "No context found"`

!`cat .build/inventory.md 2>/dev/null | head -30 || echo "No inventory"`

Analyzing:
- Existing components (anti-duplication)
- Current routes
- Database models
- Tech stack

### STEP 2: CONSULT OBLIGATOIRE

Consulting EXECUTOR for architecture analysis...

!`echo "/consult add feature: $ARGUMENTS"`

EXECUTOR will:
- Check for duplicate components
- Analyze impact on existing code
- Propose implementation strategy
- List files needed
- Calculate vagues if >= 5 files

### STEP 3: User Validation

!`echo "Review plan above"`

Validate plan before execution.

Hooks will enforce workflow even if you skip this.

### STEP 4: Execute (Plan EXACT)

Based on EXECUTOR plan:

Task(executor, haiku, MODE: EXECUTE vague 1)
Task(executor, haiku, MODE: EXECUTE vague 2)
...

### STEP 5: Validation CRITIQUE

Running validation suite...

!`echo "/validate-system"`

REQUIREMENTS:
- ✓ TypeScript: 0 errors (enforced)
- ✓ Prisma: Schema valid
- ✓ Build: Success

Hook `post-tool-use-typecheck-reporter.sh` will report ANY TypeScript error.

### STEP 6: Testing (if UI feature)

!`echo "Task(executor, haiku, skill(testing): Test $ARGUMENTS)"`

E2E test avec Chrome DevTools

### STEP 7: Auto Commit

!`echo "Task(executor, haiku, skill(git): Commit feature $ARGUMENTS)"`

Semantic commit message automatically generated

---

## ❌ VIOLATIONS BLOQUÉES

- Edit/Write sans CONSULT → **Hook bloque**
- TypeScript errors → **Reporter signal errors**
- Duplicate component → **Anti-dup détecte**
- Skip .build/ read → **Workflow router rappelle**

---

## 🔒 HOOKS ACTIFS

Protection layers enforcing workflow:

1. **user-prompt-submit-workflow-router.sh**
   - Détecte "ajoute/crée feature"
   - Inject workflow exact avec CHECK -2

2. **check-consult-before-code.sh**
   - Bloque ORCHESTRATOR Edit/Write sans CONSULT
   - Force /consult workflow

3. **pre-tool-use-perfect-prompts.sh**
   - Auto-inject keywords Task()
   - Garantit prompts EXECUTOR parfaits

4. **post-tool-use-typecheck-reporter.sh**
   - Validate TypeScript après chaque Edit/Write
   - Report errors avec actions suggestions

5. **session-start-inject-context.sh**
   - Load .build/ au démarrage
   - Tu connais déjà projet state

---

## 📊 RÉSULTAT

- **Workflow:** 100% consistent
- **TypeScript errors:** Détectés immédiatement
- **Doublons:** Impossible (inventory check)
- **Oublis:** 0 (hooks enforce)

**Tu es ROBOT. Execute workflow bêtement.**
