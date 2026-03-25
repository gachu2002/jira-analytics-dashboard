# Frontend Architecture

## Layering

- `pages` stay thin and compose feature components.
- `features` hold feature-level UI, hooks, stores, schemas, and feature-local API calls.
- `lib` holds shared client setup, third-party configuration, and low-level helpers.
- `components/common` holds reusable app-level components.
- `components/ui` is reserved for shadcn primitives.

## Current conventions

- Shared HTTP client setup lives in `src/lib/http.ts`.
- Feature transport functions live in `src/features/<feature>/api/*`.
- Forms should prefer `react-hook-form` with `zod` when validation is needed.
- Auth uses a persisted session store and refresh-token flow on bootstrap and `401` recovery.

## Import Conventions

- Always prefer feature public API exports (`features/<feature>/index.ts`).
- Avoid deep importing across feature internals.
- Use `@/` aliases for project imports.

## Folder Responsibilities

- `assets`: static files.
- `config`: app config and constants.
- `hooks`: global reusable hooks.
- `layouts`: route layout wrappers.
- `lib`: third-party setup and shared helpers.
- `routes`: router and guards.
- `stores`: cross-feature global state.
- `types`: global TypeScript types.
- `utils`: pure helper functions.
