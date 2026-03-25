# Jira Analytics Dashboard Frontend

Setup-only frontend foundation for a Jira task analytics dashboard.

## Stack

- React + TypeScript + Vite (SWC)
- Tailwind CSS v4
- shadcn/ui
- React Hook Form + Zod
- React Router
- React Query
- Zustand
- ESLint + Prettier
- Vitest + Testing Library + MSW

## Scripts

- `pnpm dev`: run app in development mode
- `pnpm dev:api`: run the local mock auth API on port 8080
- `pnpm dev:full`: run the frontend and mock API together
- `pnpm build`: build production bundle
- `pnpm preview`: preview production build locally
- `pnpm lint`: lint source files
- `pnpm typecheck`: run TypeScript checks
- `pnpm test`: run unit/integration tests
- `pnpm format`: format files with Prettier

## Non-Negotiables

- Always use shadcn components whenever a suitable component or composition exists.
- Do not build custom UI primitives if the requirement can be solved with shadcn components.
- If the same UI pattern appears in 2 or more places, extract a reusable component instead of duplicating markup.
- Define colors, semantic tokens, and reusable theme values in the global Tailwind/theme stylesheet first.
- Avoid hardcoded color utilities in components when a shared semantic token or variant should exist.
- `src/components/ui` is reserved for shadcn-oriented primitives.
- Keep `src/pages` thin; feature logic belongs in `src/features`.
- Keep shared HTTP client setup in `src/lib` and feature-local API calls inside `src/features/<feature>/api`.

## Current app shape

- `/login`: auth entry
- `/preview`: theme and component preview route
- Auth uses `react-hook-form` + `zod` for form handling and validation.
- Auth session bootstrap refreshes access on app load and retries once on `401` using the refresh token.

## Environment

Copy `.env.example` to `.env` and update values.

## Local mock auth API

The repo includes a tiny local API server for auth development.

- `POST /api/token/`
- `POST /api/token/refresh/`

For local UI work, the mock server accepts any non-empty `username` and `password`.
