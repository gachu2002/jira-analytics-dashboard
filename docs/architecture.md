# Frontend Architecture

## Layering

- `pages` stay thin and compose feature components.
- `features` hold feature-level UI, hooks, stores, schemas, and React Query hooks.
- `services` expose raw API calls.
- `components/common` holds reusable app-level components.
- `components/ui` is reserved for shadcn primitives.

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
