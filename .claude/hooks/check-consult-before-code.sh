#!/bin/bash
# PreToolUse Hook: Enforce CHECK -1 (CONSULT before coding)
#
# PURPOSE: Block ORCHESTRATOR from using Edit/Write without MODE: CONSULT
# EXCEPTION: EXECUTOR (agent context) is allowed
# EXCEPTION: .build/ updates by orchestrator are allowed
#
# This hook prevents accidental code generation without proper analysis

# Get tool name and file path from environment
TOOL_NAME="${TOOL_NAME:-unknown}"
FILE_PATH="${FILE_PATH:-}"

# Only enforce for Edit/Write tools (not Read, Glob, Grep, etc)
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Allow .build/ updates by orchestrator (special case)
if [[ "$FILE_PATH" =~ \.build/ ]]; then
  exit 0
fi

# Allow EXECUTOR (indicated by AGENT_ID environment variable)
if [[ -n "$AGENT_ID" ]]; then
  exit 0
fi

# At this point: ORCHESTRATOR trying to Edit/Write non-.build/ file
# This violates CHECK -1 workflow (must CONSULT first)

# Check if MODE: CONSULT was invoked recently
# Look for Task() calls with MODE: CONSULT in conversation context
RECENT_CONSULT=$(tail -200 ~/.claude/logs/agent-calls.log 2>/dev/null | grep -c "MODE: CONSULT" || echo "0")

if [[ "$RECENT_CONSULT" -eq 0 ]]; then
  echo ""
  echo "❌ VIOLATION: CHECK -1 - CONSULT Before Code"
  echo ""
  echo "You are ORCHESTRATOR attempting to write/edit code directly."
  echo "This violates workflow: ORCHESTRATOR → CONSULT EXECUTOR → EXECUTE"
  echo ""
  echo "REQUIRED STEPS:"
  echo "  1. Invoke Task(executor, sonnet, 'MODE: CONSULT')"
  echo "  2. EXECUTOR analyzes + returns plan"
  echo "  3. You invoke Task(executor, haiku, 'MODE: EXECUTE') with plan"
  echo ""
  echo "EXCEPTIONS (allowed to code directly):"
  echo "  • .build/ directory updates (orchestrator responsibility)"
  echo "  • Simple .env or config fixes (<3 lines)"
  echo "  • CLAUDE.md or system meta-updates"
  echo ""
  echo "FILE ATTEMPTED: $FILE_PATH"
  echo "TOOL: $TOOL_NAME"
  echo ""
  echo "ACTION: Stopped - Please follow workflow"
  echo ""
  exit 1
fi

# If MODE: CONSULT found recently, allow the code
exit 0
