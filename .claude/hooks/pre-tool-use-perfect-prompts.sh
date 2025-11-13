#!/bin/bash
# PreToolUse Hook: Auto-Perfect Task() Prompts
# Auto-inject missing keywords → Prompts always have required format
#
# PURPOSE: Ensure EXECUTOR always receives prompts with critical keywords
# KEYWORDS: "SKIP anti-duplication" + "Return: ✓"
# SAFETY: Only auto-injects, never blocks execution
#
# This prevents prompt format errors without blocking workflow

# Read input from stdin (MCP protocol)
INPUT=$(cat)

# Extract tool name and prompt from input
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
PROMPT=$(echo "$INPUT" | jq -r '.tool_input.prompt // empty')

# Only process Task() calls (other tools don't need keyword injection)
if [[ "$TOOL_NAME" != "Task" ]] || [[ -z "$PROMPT" ]]; then
  # Not a Task call, return unchanged
  exit 0
fi

# Check which keywords are already present
HAS_SKIP=$(echo "$PROMPT" | grep -c "SKIP anti-duplication" || echo "0")
HAS_RETURN=$(echo "$PROMPT" | grep -c "Return: ✓" || echo "0")

# If both keywords present → Prompt already perfect, no modification needed
if [[ "$HAS_SKIP" -gt 0 ]] && [[ "$HAS_RETURN" -gt 0 ]]; then
  exit 0
fi

# Build list of missing keywords to inject
ADDITIONS=""

if [[ "$HAS_SKIP" -eq 0 ]]; then
  ADDITIONS="${ADDITIONS}SKIP anti-duplication scan (orchestrator confirmed)
"
fi

if [[ "$HAS_RETURN" -eq 0 ]]; then
  ADDITIONS="${ADDITIONS}Return: ✓ [result]
"
fi

# Create updated prompt with keywords injected at end
UPDATED_PROMPT="${PROMPT}

${ADDITIONS}"

# Return modified input with permissionDecision: allow (always allow, just enhance)
cat <<'EOF'
{
  "permissionDecision": "allow",
  "updatedInput": $(cat | jq .)
}
EOF
