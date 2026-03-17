#!/bin/bash

# Ensure a commit message is provided
if [ -z "$1" ]; then
  echo "Error: No commit message provided."
  exit 1
fi

# Store the commit message
COMMIT_MSG="$1"

# Check if there are any staged changes
if git diff --cached --quiet; then
  # No staged changes, stage everything
  git add .
fi

# Perform the commit
if git commit -m "$COMMIT_MSG"; then
  echo "Success: Committed with message '$COMMIT_MSG'."
else
  echo "Error: Commit failed."
  exit 1
fi
