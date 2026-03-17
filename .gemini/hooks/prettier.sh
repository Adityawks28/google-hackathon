#!/usr/bin/env bash

# Read the JSON input from stdin (Gemini CLI pipes context here)
input=$(cat)

# Extract the file path from the tool input
FILE_PATH=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# If no file path found, allow and exit
if [[ -z "$FILE_PATH" ]]; then
  echo '{}' 
  exit 0
fi

# Check if the file exists (it might have been deleted)
if [[ ! -f "$FILE_PATH" ]]; then
  echo '{}' 
  exit 0
fi

# Only run Prettier on file types it supports
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|\
  *.json|*.css|*.scss|*.less|\
  *.html|*.vue|*.svelte|\
  *.md|*.mdx|*.yaml|*.yml|\
  *.graphql|*.gql)
    # Run Prettier on the file
    OUTPUT=$(npx prettier --write "$FILE_PATH" 2>&1)
    PRETTIER_EXIT=$?

    if [[ $PRETTIER_EXIT -ne 0 ]]; then
      # Prettier failed — deny and tell the agent why
      echo "prettier failed" >&2
      jq -n \
        --arg reason "Prettier formatting failed for $FILE_PATH: $OUTPUT" \
        --arg msg "⚠️ Prettier failed on $FILE_PATH" \
        '{
          decision: "deny",
          reason: $reason,
          systemMessage: $msg
        }'
      exit 0
    fi

    # Prettier succeeded — allow and notify
    echo "✅ Formatted: $FILE_PATH" >&2
    jq -n \
      --arg msg "✅ Prettier formatted: $FILE_PATH" \
      '{
        systemMessage: $msg
      }'
    exit 0
    ;;
  *)
    # Not a Prettier-supported file type, skip silently
    echo '{}' 
    exit 0
    ;;
esac
