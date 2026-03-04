---
name: frontend-design
description: Use only for substantial dashboard UI work (new/changed layouts, KPI cards, charts, tables, filters), not routine logic or backend tasks.
---

# Frontend Design

Use this skill for UI work in dashboard pages, charts, KPI cards, tables, filters, and layout systems.

## Outcome

- Build production-grade UI that is both distinctive and highly scannable.
- Preserve data readability, semantic color usage, and responsive behavior.
- Avoid generic aesthetics and one-off styling decisions.

## Visual direction

- Start by choosing an intentional design direction, then execute it consistently.
- Keep the product language analytical and decision-first for this repository.
- Favor clarity and hierarchy over ornamental effects.

## Token and styling rules

- Prefer existing variables in `src/styles/index.css` before introducing new tokens.
- Use semantic accents consistently: action (`--accent-blue`), success (`--accent-green`), warning (`--accent-amber`), risk (`--accent-red`).
- Keep spacing and radii disciplined; avoid ad-hoc values unless reusable.

## Typography and density

- Keep body copy in sans-serif; use monospaced styling for metrics and numeric tables.
- Preserve tabular numerals for changing numbers to prevent jitter.
- Keep KPI values high contrast with short, muted supporting text.

## Layout hierarchy

- Structure pages in order: context header, active filters, KPI strip, primary charts, supporting details.
- Maintain consistent shell geometry and gutter behavior across pages.
- Keep panel proportions stable so cross-page comparisons remain easy.

## Chart and table standards

- Keep chart legend, tooltip, and axis treatment consistent across cards.
- Use restrained motion for chart reveals; no animation that obscures values.
- Right-align numeric columns and show explicit units for counts, percentages, and points.

## Responsiveness and interaction

- Stack complex visualizations before shrinking below legibility.
- Prevent horizontal clipping for tables and filter chips.
- Keep interactions immediate and subtle (roughly 100-200ms).
- Preserve visible keyboard focus on all interactive controls.

## Design QA checklist

- Are tokenized colors and spacing used consistently?
- Is hierarchy obvious at first glance (context -> KPI -> trend -> detail)?
- Are chart colors semantically consistent with other screens?
- Is readability preserved at small and medium breakpoints?
- Do hover/focus/motion effects improve comprehension instead of adding noise?
