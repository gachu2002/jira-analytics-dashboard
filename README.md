# Jira Analytics Dashboard Frontend

Setup-only frontend foundation for a Jira task analytics dashboard.

## Stack

- React + TypeScript + Vite (SWC)
- Tailwind CSS v4
- shadcn/ui
- React Router
- React Query
- Zustand
- ESLint + Prettier
- Vitest + Testing Library + MSW

## Scripts

- `pnpm dev`: run app in development mode
- `pnpm mock:server`: run local mock API server on port 8080
- `pnpm dev:full`: run mock API + frontend together
- `pnpm build`: build production bundle
- `pnpm preview`: preview production build locally
- `pnpm lint`: lint source files
- `pnpm typecheck`: run TypeScript checks
- `pnpm test`: run unit/integration tests
- `pnpm format`: format files with Prettier

## Architecture

Project follows the folder layout documented in `docs/architecture.md`.

## Notes

- `components/ui` is reserved for shadcn-generated primitives.
- `pages` are route wrappers; feature logic belongs in `features`.
- `services` expose raw API calls; React Query hooks stay in feature `api` folders.

## Environment

Copy `.env.example` to `.env` and update values.
