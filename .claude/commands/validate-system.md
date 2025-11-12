---
description: Run complete system validation (TypeScript, Prisma, Build)
allowed-tools: Bash(npm:*)
---

# System Validation

Running complete validation suite...

## 1. TypeScript Check
!`cd /home/pilote/projet/primaire/BUILDER/frontend && npm run typecheck 2>&1 | tail -30`

## 2. Prisma Schema Validation
!`cd /home/pilote/projet/primaire/BUILDER/frontend && npm run prisma:validate 2>&1`

## 3. Production Build Test
!`cd /home/pilote/projet/primaire/BUILDER/frontend && npm run build 2>&1 | tail -20`

---

**Summary:**
- ✅ All checks passed → System healthy
- ❌ Errors found → Fix required before deployment

Use this command:
- After major features
- Before git push
- Before production deployment
- When debugging build issues
