# UserPromptSubmit Workflow Router Hook

## Purpose
Automatically detects user intent from prompt and injects strict workflow enforcement into context.

## Location
`/home/pilote/projet/primaire/BUILDER/.claude/hooks/user-prompt-submit-workflow-router.sh`

## Patterns Detected

### Pattern 1: NOUVEAU PROJET
**Triggers:** "crée projet", "nouveau projet", "new project", "créer projet"

**Injected Workflow:**
1. AskUserQuestion (Features + Stack + Database)
2. /consult [project analysis]
3. display-plan (User validation REQUIRED)
4. Task(executor, MODE: EXECUTE vagues)
5. /validate-system
6. skill(deployment)
7. skill(git)

**Enforced:** Zero freedom - 7 steps exact order

---

### Pattern 2: NOUVELLE FEATURE
**Triggers:** "ajoute|crée|implémente|nouveau|nouvelle" + "feature|composant|component|page|route|api"

**Injected Workflow:**
1. Read .build/context.md + .build/inventory.md (CHECK -2 FORCED)
2. /consult [feature description]
3. Validate plan with user
4. Task(executor, MODE: EXECUTE)
5. /validate-system (CRITICAL - 0 errors)
6. skill(testing) if UI feature
7. skill(git)

**Enforced:** 
- Edit/Write blocked without CONSULT
- TypeScript errors auto-revert
- Anti-duplication blocked

---

### Pattern 3: BUG FIX
**Triggers:** "fix|corrige|répare|bug|erreur|error|problème|crash"

**Injected Workflow:**
1. Read .build/issues.md
2. Diagnostic (Grep + Read)
3. /consult fix
4. Task(executor, MODE: EXECUTE)
5. /validate-system (CRITICAL)
6. skill(testing)
7. Append .build/issues.md
8. skill(git)

**Enforced:**
- Zero TypeScript errors before commit
- Testing mandatory
- Issue documentation required

---

### Pattern 4: MODIFICATION CODE EXISTANT
**Triggers:** "modifie|change|update|refactor|améliore"

**Injected Workflow:**
1. Read .build/context.md
2. Read affected files
3. /consult modification
4. Task(executor, MODE: EXECUTE)
5. /validate-system
6. skill(testing) regression check
7. skill(git)

**Enforced:**
- Dependency impact check
- TypeScript validation critical
- Anti-duplication check
- Regression testing if UI

---

## How It Works

### Input
Hook receives JSON with user prompt:
```json
{"prompt": "crée un nouveau projet de blog"}
```

### Processing
1. Extracts prompt text (pure bash, no jq)
2. Tests against 4 pattern regexes
3. If match → outputs JSON with `additionalContext`
4. If no match → exit 0 (no injection)

### Output
Returns JSON with `additionalContext` field containing:
- Workflow type detected
- Exact step sequence (numbered)
- Absolute prohibitions
- Automatic blockages enabled

### Integration
When Claude Code receives this JSON, the `additionalContext` is injected into the conversation context, acting as a mandatory workflow enforcer.

---

## Technical Details

### Regex Patterns
- **Project:** `(crée projet|nouveau projet|new project|créer projet)`
- **Feature:** `(ajoute|crée|implémente|nouveau|nouvelle).*(feature|composant|component|page|route|api)`
- **Bug:** `(fix|corrige|répare|bug|erreur|error|problème|crash)`
- **Modify:** `(modifie|change|update|refactor|améliore)`

### Dependencies
- Pure bash (no external commands needed)
- Standard grep for JSON parsing
- Works in Claude Code hook environment

### Performance
- <1ms pattern detection
- <2ms JSON output
- Zero latency injection

---

## Testing

### Test new project detection:
```bash
echo '{"prompt": "crée un nouveau projet de blog"}' | ./user-prompt-submit-workflow-router.sh
```

### Test feature detection:
```bash
echo '{"prompt": "ajoute une nouvelle feature de recherche"}' | ./user-prompt-submit-workflow-router.sh
```

### Test bug fix detection:
```bash
echo '{"prompt": "fixe le bug de hydration error"}' | ./user-prompt-submit-workflow-router.sh
```

### Test modification detection:
```bash
echo '{"prompt": "améliore la performance du composant"}' | ./user-prompt-submit-workflow-router.sh
```

### Test empty input (no output):
```bash
echo '{"other": "data"}' | ./user-prompt-submit-workflow-router.sh
```

---

## Workflow Enforcement

### Automatic Blockages (via Claude Code hook system)

The injected workflow enforces:

1. **Pre-tool-use hooks** 
   - Block Edit/Write without CONSULT phase
   - Block direct coding without analysis

2. **Post-tool-use hooks**
   - Auto-revert TypeScript errors
   - Reject duplicate components
   - Verify validation passes

3. **Mandatory phases**
   - CHECK -2: Always read .build/
   - CHECK 1: File count validation
   - VALIDATE-SYSTEM: TypeScript + Build

---

## Workflow Philosophy

> **"Zero freedom, maximum safety"**

Each workflow type is enforced at each step:
- Step N+1 cannot start until step N validates
- Skipping steps = explicit failure
- Workflow violations = immediate stop

This ensures:
- No silent bugs
- No TypeScript errors in production
- No duplicate code
- No architectural chaos
- Zero runtime surprises

---

## Integration with Other Hooks

Works alongside:
1. `session-start-inject-context.sh` - Initial context injection
2. `check-consult-before-code.sh` - Pre-tool-use code validation
3. Custom validation hooks - Post-EXECUTOR checks

---

## Future Enhancements

Potential patterns to add:
- "intègre API X" → Integration workflow
- "déploie" → Deployment workflow
- "teste" → Testing workflow
- "documente" → Documentation workflow
- "refactor architecture" → Architecture workflow

