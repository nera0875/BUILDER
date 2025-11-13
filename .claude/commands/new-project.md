---
description: Create new project with STRICT enforced workflow
argument-hint: [project-name]
---

# New Project - Workflow Scellé

Project: **$ARGUMENTS**

---

## ⚠️ WORKFLOW NON-NÉGOCIABLE (7 Steps)

### STEP 1: Questions OBLIGATOIRES

Collecting requirements...

!`echo "Launching AskUserQuestion for project requirements"`

Features? Stack? Database?

### STEP 2: CONSULT FORCÉ

Analyzing architecture with EXECUTOR...

!`echo "/consult new project: $ARGUMENTS"`

EXECUTOR will:
- Analyze requirements
- Propose architecture
- List all files needed
- Calculate vagues if >= 5 files
- Estimate time

### STEP 3: Validation User REQUISE

!`echo "Displaying plan via display-plan"`

User MUST validate plan before execution.

Type 'y' to continue or 'n' to revise.

### STEP 4: Execution par Vagues

Based on EXECUTOR plan:
- Vague 1: Independent files (parallel)
- Vague 2: Dependent files
- Vague 3: Final integration

Task(executor, haiku, MODE: EXECUTE per vague)

### STEP 5: Validation CRITIQUE

Running system validation...

!`echo "/validate-system"`

MUST PASS:
- ✓ TypeScript 0 errors
- ✓ Prisma schema valid
- ✓ Build success

IF errors → STOP + fix BEFORE continuing

### STEP 6: Deployment AUTO

!`echo "Task(executor, haiku, skill(deployment): Deploy $ARGUMENTS)"`

PM2 setup + Preview URL generation

### STEP 7: Commit AUTO

!`echo "Task(executor, haiku, skill(git): Commit initial project)"`

Semantic commit message + push to GitHub

---

## ❌ INTERDICTIONS ABSOLUES

- Skip user questions
- Code without CONSULT
- Create >5 files without vagues
- Ignore TypeScript errors
- Deploy without validation
- Forget initial commit

---

## 🤖 ENFORCEMENT

Hooks monitoring cette command:
- `user-prompt-submit-workflow-router.sh` → Détecte "new project"
- `check-consult-before-code.sh` → Bloque Edit/Write sans CONSULT
- `pre-tool-use-perfect-prompts.sh` → Auto-perfect Task() keywords
- `post-tool-use-typecheck-reporter.sh` → Report TypeScript errors
- `session-start-inject-context.sh` → Load .build/ context

---

**Tu es CADRÉ. Execute ces 7 steps EXACTEMENT.**
