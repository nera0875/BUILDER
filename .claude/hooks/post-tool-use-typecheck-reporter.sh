#!/bin/bash
# PostToolUse Hook: TypeScript Validation Reporter
# Reports errors → User/Claude décide action (PAS de revert auto)

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only process Edit/Write on TypeScript files
if [[ ! "$TOOL_NAME" =~ ^(Edit|Write)$ ]]; then
  exit 0
fi

if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

# Find project root
PROJECT_DIR=$(dirname "$FILE_PATH")

while [[ "$PROJECT_DIR" != "/" ]]; do
  if [ -f "$PROJECT_DIR/package.json" ]; then
    break
  fi
  PROJECT_DIR=$(dirname "$PROJECT_DIR")
done

# Skip if no package.json found
if [ ! -f "$PROJECT_DIR/package.json" ]; then
  exit 0
fi

# ════════════════════════════════════════════
# Run TypeScript Check
# ════════════════════════════════════════════

cd "$PROJECT_DIR"

TYPECHECK_OUTPUT=$(npm run typecheck 2>&1)

if echo "$TYPECHECK_OUTPUT" | grep -q "Found 0 errors"; then
  # ✅ SUCCESS: Auto-format + git stage

  npx prettier --write "$FILE_PATH" 2>/dev/null || true
  git add "$FILE_PATH" 2>/dev/null || true

  echo "✅ TypeScript validation passed: $FILE_PATH" >&2
  exit 0
fi

# ════════════════════════════════════════════
# ❌ ERRORS FOUND → REPORT (no revert)
# ════════════════════════════════════════════

ERROR_COUNT=$(echo "$TYPECHECK_OUTPUT" | grep -o "Found [0-9]* error" | grep -o "[0-9]*")
ERROR_DETAILS=$(echo "$TYPECHECK_OUTPUT" | tail -20)

cat <<EOF
{
  "additionalContext": "⚠️ TypeScript ERRORS DETECTED

FILE MODIFIED: $FILE_PATH
ERRORS FOUND: $ERROR_COUNT

ERRORS:
$ERROR_DETAILS

⚠️ ACTION REQUIRED:

Options:
1. Run /validate-system (voir tous errors)
2. /consult fix TypeScript errors
3. Task(executor, fix types in $FILE_PATH)
4. Ou git checkout $FILE_PATH (revert manuel)

FILE NOT REVERTED (you control next action)

REPORTED BY: post-tool-use-typecheck-reporter.sh"
}
EOF

exit 0
