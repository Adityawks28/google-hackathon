---
name: commit
description: Create meaningful conventional commits based on implementation overviews. Use when finalizing changes and preparing to commit to source control using the "feat: verb + ..." or "chore: verb + ..." format.
---

# Commit

This skill helps generate and execute conventional commits.

## Guidelines

- **Format**: `<type>: <verb> <description>`
- **Types**:
  - `feat`: New feature or significant addition.
  - `chore`: Maintenance, updates, or minor changes.
  - `fix`: Bug fixes.
  - `style`: Formatting, missing semi-colons, etc; no code change.
  - `refactor`: Refactoring production code.
  - `docs`: Documentation changes.
  - `test`: Adding missing tests, refactoring tests; no production code change.
- **Verb**: Must be **lowercase** and in **present tense** (e.g., `implement`, `add`, `fix`, `update`).
- **Description**: Meaningful description of what was changed.

## Workflow

1.  **Gather Context**: Read the implementation overview provided by the user or the current task context.
2.  **Generate Message**: Construct a message following the guidelines.
    - *Example*: `feat: implement commit skill`
    - *Example*: `chore: update commit script for better error handling`
3.  **Commit**: Use the provided script to commit the changes.

## Scripts

### commit.sh
A bash script that takes a commit message, stages changes (if none are staged), and performs the commit.

**Usage**:
```bash
bash .gemini/skills/commit/scripts/commit.sh "feat: add user authentication"
```
