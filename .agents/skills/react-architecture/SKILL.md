---
name: react-architecture
description: Use only when changing React structure or data flow (feature boundaries, state ownership, API/view-model mapping), not for cosmetic-only edits.
---

# React Architecture

Use this skill when implementing or refactoring React + TypeScript code in this repository.

## Scope

- Feature development in `src/features/*`.
- Page and route composition in `src/pages/*` and `src/routes/*`.
- API integration, data flow, and state boundaries.

## Architecture boundaries

- Keep `src/pages` thin: route parameters and composition only.
- Place feature logic in `src/features/<feature>` (`api`, `components`, `hooks`, `schemas`, `types`, optional stores).
- Keep transport details in `src/services/*` and shared client setup in `src/lib/*`.
- Export feature public APIs from `src/features/<feature>/index.ts`; avoid cross-feature deep imports.
- Use `src/components/common` for app-level reusable components; keep `src/components/ui` for shadcn-oriented primitives.
- If a component pattern is used in 2 or more places, extract it instead of duplicating it.
- Prefer the narrowest reusable home first: feature-local shared component before promoting to app-level common/shared.

## State and data ownership

- React Query owns remote/server state.
- Zustand owns cross-route UI state.
- Local component state owns local interaction concerns.
- Do not duplicate synchronized state; derive values from source of truth.
- Always render explicit loading, error, and empty states for async surfaces.

## API and typing rules

- Define payload/result types explicitly in feature or global type modules.
- Validate unknown external input with Zod when appropriate.
- Map DTO/service responses into UI-friendly view models before presentational rendering.
- Avoid parsing unknown response shapes inside presentational components.
- Use `@/` aliases for internal imports.

## Component rules

- Keep components role-focused: layout, card, chart, table, control.
- Use explicit props and avoid hidden coupling to unrelated global stores.
- Prefer composition over multiplying boolean flags for divergent render paths.
- Extract blocks when JSX becomes difficult to scan.
- Extract repeated UI once it appears in 2 or more places, especially for cards, form rows, table controls, section shells, and status displays.
- Use semantic elements for headings, tables, and landmarks.

## Performance expectations

- Lazy-load heavy visual modules and provide skeleton fallbacks.
- Move expensive calculations out of render or memoize when repeatedly recomputed.
- Avoid unnecessary wrappers and rerender churn in dense dashboard trees.

## PR checklist

- Are boundaries respected (`pages` thin, feature logic colocated, no deep imports)?
- Is state ownership clear (React Query vs Zustand vs local state)?
- Are loading/error/empty states explicit and testable?
- Are type boundaries strong and free from `any` leaks in changed code?
