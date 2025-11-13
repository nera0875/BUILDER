# Workflow Router Hook - Quick Reference

## Files

| File | Purpose | Status |
|------|---------|--------|
| `user-prompt-submit-workflow-router.sh` | Pattern detection + workflow injection | Active |
| `USER-PROMPT-SUBMIT-WORKFLOW.md` | Full documentation | Reference |
| `session-start-inject-context.sh` | Initial context injection | Active |
| `check-consult-before-code.sh` | Pre-tool-use validation (blocks unsafe edits) | Active |
| `pre-tool-use-perfect-prompts.sh` | Auto-injects missing keywords (Task prompts) | Active |
| `QUICK-REFERENCE.md` | This file | Reference |

---

## PreToolUse Hooks

### 1. `check-consult-before-code.sh`
**Purpose:** Enforce CHECK -1 workflow (CONSULT before code)
- Blocks ORCHESTRATOR from using Edit/Write without MODE: CONSULT
- Allows EXECUTOR (agent context) automatically
- Allows .build/ updates by orchestrator
- **Safety:** Blocks unsafe operations

### 2. `pre-tool-use-perfect-prompts.sh` (NEW)
**Purpose:** Auto-inject missing keywords into Task() prompts
- Ensures EXECUTOR always receives well-formed prompts
- Auto-injects: `SKIP anti-duplication` + `Return: ✓ [result]`
- Only modifies Task() calls, ignores other tools
- **Safety:** Never blocks, only enhances

**Example:**
```bash
# Input (incomplete prompt)
Task(executor, haiku, "Create component X with props Y")

# Hook auto-injects:
# - SKIP anti-duplication scan (orchestrator confirmed)
# - Return: ✓ [result]

# Output (perfect prompt)
Task(executor, haiku, "Create component X with props Y
SKIP anti-duplication scan (orchestrator confirmed)
Return: ✓ [result]")
```

---

## Pattern Detection

### Detected Patterns → Workflows Injected

```
Input Pattern                          Workflow Type
────────────────────────────────────────────────────────────
"crée projet" | "nouveau projet"      → NOUVEAU PROJET (7 steps)
"ajoute" + "feature|composant|page"   → NOUVELLE FEATURE (7 steps)
"fix" | "bug" | "erreur" | "crash"    → BUG FIX (8 steps)
"modifie" | "change" | "refactor"     → MODIFICATION (7 steps)
Other prompts                          → No injection (fallback)
```

---

## Testing

### Run Single Pattern Test
```bash
echo '{"prompt": "crée un nouveau projet"}' | \
  /home/pilote/projet/primaire/BUILDER/.claude/hooks/user-prompt-submit-workflow-router.sh
```

### Run Full Test Suite
```bash
/tmp/test-workflow-router.sh  # Runs 17 tests
```

### Expected Output
```json
{
  "additionalContext": "⚠️ WORKFLOW DÉTECTÉ: NOUVEAU PROJET\n\nÉTAPES OBLIGATOIRES...\n"
}
```

---

## Workflow Sequences

### 1. NOUVEAU PROJET (7 steps)
```
1. AskUserQuestion (Features + Stack + Database)
2. /consult [project analysis]
3. display-plan (User validation REQUIRED)
4. Task(executor, MODE: EXECUTE vagues)
5. /validate-system
6. skill(deployment)
7. skill(git)
```

### 2. NOUVELLE FEATURE (7 steps + enforcements)
```
1. Read .build/context.md + .build/inventory.md
2. /consult [feature description]
3. Validate plan with user
4. Task(executor, MODE: EXECUTE)
5. /validate-system (CRITICAL)
6. skill(testing) if UI
7. skill(git)

Enforcements:
- Edit/Write blocked without CONSULT
- TypeScript errors auto-revert
- Anti-duplication blocked
```

### 3. BUG FIX (8 steps + enforcements)
```
1. Read .build/issues.md
2. Diagnostic (Grep + Read)
3. /consult fix
4. Task(executor, MODE: EXECUTE)
5. /validate-system (CRITICAL)
6. skill(testing)
7. Append .build/issues.md
8. skill(git)

Enforcements:
- Zero TypeScript errors before commit
- Testing mandatory (reproduction)
- Issue documentation required
```

### 4. MODIFICATION (7 steps + enforcements)
```
1. Read .build/context.md
2. Read affected files
3. /consult modification
4. Task(executor, MODE: EXECUTE)
5. /validate-system
6. skill(testing) regression
7. skill(git)

Enforcements:
- Dependency impact check
- TypeScript validation critical
- Anti-duplication obligatory
- Regression testing if UI
```

---

## Technical Details

### Implementation
- **Language:** Bash
- **Size:** 4.8 KB
- **Dependencies:** Pure bash (grep only, no jq)
- **Performance:** <2ms pattern detection
- **Format:** JSON output

### Regex Patterns Used

| Pattern Type | Regex |
|--------------|-------|
| New Project | `(crée projet\|nouveau projet\|new project\|créer projet)` |
| Feature | `(ajoute\|crée\|implémente\|nouveau\|nouvelle).*(feature\|composant\|component\|page\|route\|api)` |
| Bug | `(fix\|corrige\|répare\|bug\|erreur\|error\|problème\|crash)` |
| Modify | `(modifie\|change\|update\|refactor\|améliore)` |

---

## Integration with Claude Code

### Execution Flow
```
User submits prompt
    ↓
Hook activated (automatic)
    ↓
JSON parsing (extract prompt text)
    ↓
Pattern matching (regex test)
    ↓
Workflow injection (if match)
    ↓
Claude Code receives additionalContext
    ↓
Workflow enforced automatically
```

### Output Injection
When pattern matches, hook outputs:
```json
{
  "additionalContext": "[Workflow steps + enforcements]"
}
```

This is automatically merged into Claude Code context.

---

## Monitoring & Debugging

### Check Hook Status
```bash
# Verify file exists and executable
ls -la /home/pilote/projet/primaire/BUILDER/.claude/hooks/user-prompt-submit-workflow-router.sh

# Verify permissions
stat /home/pilote/projet/primaire/BUILDER/.claude/hooks/user-prompt-submit-workflow-router.sh
```

### Test Specific Pattern
```bash
# New Project
echo '{"prompt": "crée un nouveau projet de blog"}' | \
  /home/pilote/projet/primaire/BUILDER/.claude/hooks/user-prompt-submit-workflow-router.sh

# Feature
echo '{"prompt": "ajoute un composant de statistiques"}' | \
  /home/pilote/projet/primaire/BUILDER/.claude/hooks/user-prompt-submit-workflow-router.sh
```

### View Full Output
```bash
# See complete workflow injection
echo '{"prompt": "crée un nouveau projet"}' | \
  /home/pilote/projet/primaire/BUILDER/.claude/hooks/user-prompt-submit-workflow-router.sh | \
  jq '.additionalContext'
```

---

## Future Enhancements

Patterns to add:
- "intègre API X" → Integration workflow
- "déploie" → Deployment workflow
- "teste" → Testing workflow
- "documente" → Documentation workflow
- "refactor architecture" → Architecture workflow

---

## Philosophy

**"Zero freedom, maximum safety"**

- No skippable steps
- Validation gates between steps
- Automatic blockages on violations
- System-wide workflow enforcement

Result: Zero runtime surprises, zero architectural chaos.

---

**Last Updated:** 2025-11-13
**Status:** Production Ready
**Test Coverage:** 17/17 tests passing
