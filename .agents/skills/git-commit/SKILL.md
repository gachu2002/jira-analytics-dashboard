---
name: git-commit
description: Manual commit workflow skill; use only when the user explicitly asks to create a commit.
disable-model-invocation: true
---

# Git Commit

Use this skill when the user asks to create a commit.

## Context checks

- Review current status and diff.
- Ensure changes are intentionally scoped for one commit.
- Confirm frontend quality gates already passed for non-trivial code changes.

## Commit workflow

1. Stage only relevant files.
2. Write a concise message focused on intent and outcome.
3. Create one commit.
4. Re-check status to confirm a clean post-commit state.

## Safety rules

- Never include secrets or credential files.
- Do not rewrite history unless explicitly requested.
- Keep unrelated modifications out of the commit.
