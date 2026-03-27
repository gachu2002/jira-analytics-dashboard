---
name: frontend-quality-gates
description: Use only at verification time (pre-commit or pre-PR) to run lint, typecheck, tests, build, and regression checks.
disable-model-invocation: true
---

# Frontend Quality Gates

Use this skill when finishing implementation work and preparing a branch for review.

## When not to load

- Do not load during implementation planning or code changes in progress.
- Do not load as a substitute for design, architecture, copy, or shadcn decisions.
- Do not load for commit creation itself; use `git-commit` after verification is complete.

## Run order

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`

This mirrors CI in `.github/workflows/ci.yml`.

## Triage workflow

- Resolve lint failures first.
- Resolve type failures before test interpretation when possible.
- For test failures, determine behavior regressions vs stale assertions.
- For build failures, inspect imports, chunking, lazy loads, and alias usage.
- After iterative fixes, rerun the full gate sequence.

## Frontend regression checks

- Route guards still enforce auth/guest behavior.
- Changed data surfaces still show loading/error/empty states.
- Charts/tables remain readable on narrow viewports with no critical clipping.
- Numeric formatting remains consistent (alignment, units, percentages).
- Timeline filters and sticky headers remain stable with no major layout shift.
- Authenticated pages still feel dense, operational, and comfortable to scan.

## Done criteria

- All four gates pass locally.
- Changed screens get a quick manual UI sanity check.
- No debug leftovers or accidental dead code in the final diff.
- Verification happens after the implementation scope is already settled.
