#!/bin/bash

# Ensure gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    exit 1
fi

TITLE=$1
BODY=$2

if [ -z "$TITLE" ]; then
    echo "Usage: $0 <pr-title> [<pr-body>]"
    exit 1
fi

# Create PR using the provided title and either a provided body or the template file
if [ -z "$BODY" ]; then
    # Use template file directly if no body is provided
    gh pr create --title "$TITLE" --body-file .github/PULL_REQUEST_TEMPLATE.md --assignee "@me"
else
    # Use provided body
    gh pr create --title "$TITLE" --body "$BODY" --assignee "@me"
fi
