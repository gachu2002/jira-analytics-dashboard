# React Best Practices Skill

This skill defines senior-level standards for building maintainable, production-ready React code in this repository.

## 1) Architecture Boundaries

- Keep route files in `src/pages` thin. They compose feature modules and pass route params only.
- Put feature behavior in `src/features/<feature>` (API hooks, components, stores, schemas, mappers).
- Keep third-party setup in `src/lib` and raw HTTP calls in `src/services`.
- Export feature public API from `src/features/<feature>/index.ts`; avoid ad-hoc cross-feature deep imports.

## 2) State Model

- Use React Query for server state (fetching, caching, background sync, loading and error state).
- Use Zustand for app UI state that spans routes (layout, filters, panel state).
- Keep feature-local UI state in feature stores or local component state.
- Prefer derived selectors over duplicated state.

## 3) Component Design

- Build presentational components with explicit props and no hidden global coupling.
- Keep components small and role-based: layout wrapper, card, chart, table, control.
- Extract repeated visual patterns into `components/common`.
- Keep `components/ui` for shadcn primitives and minimal local adaptation.

## 4) Data Contracts

- Define API and view-model types explicitly in `types` and feature `types`.
- Map backend DTOs into UI-friendly view models before rendering.
- Never let UI components parse unknown API shapes directly.

## 5) Performance Rules

- Lazy-load route pages and heavy visual modules (charts).
- Memoize only when measurement or repeated computation justifies it.
- Keep render trees flat in dashboard pages; avoid unnecessary wrappers.
- Use skeletons for loading states; avoid blocking page shell rendering.

## 6) UX and Accessibility

- Preserve keyboard navigation and visible focus styles on all controls.
- Keep data density high but readable: stable spacing, typography hierarchy, and contrast.
- Use semantic markup for tables and headings.
- Make empty, loading, and error states explicit and testable.

## 7) Testing Strategy

- Unit test formatters, mappers, and conditional status logic.
- Component test critical dashboard cards and state transitions.
- Mock network with MSW for deterministic UI tests.
- Prefer behavior assertions over implementation detail assertions.

## 8) Code Review Checklist

- Is feature logic colocated in the correct module?
- Are states and side effects in the right layer?
- Are tokens and reusable components used instead of one-off styles?
- Is the page responsive at target breakpoints and free of overflow?
- Do lint, typecheck, tests, and build pass before merge?
