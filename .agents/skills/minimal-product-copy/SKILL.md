---
name: minimal-product-copy
description: Use for restrained UI copy with minimal wording and no invented product claims.
---

# Minimal Product Copy

Use this skill when writing or revising user-facing product text in this repository.

## When not to load

- Do not load for visual design, layout treatment, or component polish; use `frontend-design`.
- Do not load for app shell, sidebar, or dense workspace layout decisions; use `enterprise-workspace-ui`.
- Do not load for structural React refactors or data-flow changes; use `react-architecture`.

## Goals

- Keep wording minimal.
- Prefer literal labels over descriptive marketing copy.
- Remove explanation unless it is necessary for task completion or error recovery.
- Avoid inventing workflows, business claims, benefits, or user intent that the user did not provide.
- Keep operational screens terse and hierarchy-light.

## Default style

- Short headings.
- Short button labels.
- Short helper text only when functionally necessary.
- Neutral tone.
- No promotional language.
- No decorative subtitles on workspace pages unless they materially help orientation.

## Rules

- Do not add helper text just to fill space.
- Do not explain obvious controls.
- Do not add trust claims, enterprise claims, or product positioning copy unless the user explicitly asks for it.
- Auth screens should be especially restrained.
- Empty states and notices should say only what is needed.
- If a label works, do not add a subtitle.
- Toolbar labels, nav labels, and panel titles should be compact.
- Avoid turning metadata into explanatory sentences.
- On authenticated work surfaces, default to labels and counts rather than prose.

## Good examples

- `Sign in`
- `Username`
- `Password`
- `Retry`
- `No results`
- `Failed to load data`
- `Bugs`
- `Milestones`
- `Projects`
- `Packages`

## Avoid

- `Welcome to the delivery control room`
- `Review milestone pacing and release quality with a high-clarity dashboard`
- `Built for enterprise teams`
- Any explanatory copy that was not requested
- `Projects anchor the left side while packages render across the time axis`
- Any heading/subtitle added only to make the page feel more designed
