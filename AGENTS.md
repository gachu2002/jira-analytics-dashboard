# Jira Analytics Dashboard

Frontend-first React/Vite workspace for a Jira analytics product with three key surfaces:

- login
- milestone timeline / gantt
- bug and quality timeline / gantt

## Product direction

- Build for enterprise delivery teams, PMO leads, engineering managers, and exec reviewers.
- Prefer an Atlassian-adjacent visual language: cool neutrals, strong contrast, restrained blue emphasis, and operational clarity over decorative warmth.
- Optimize for dense but readable analytics, timeline scanning, and filter-heavy workflows.
- Treat Jira, Outlook Web, and ChatGPT app shell patterns as primary layout references for authenticated pages: pane-based, compact, structural, and viewport-owning.

## Architecture rules

- Keep `src/pages` thin and push reusable logic or stateful behavior into feature modules when the app grows.
- Keep `src/components/ui` for shadcn-oriented primitives.
- Put app-level reusable compositions in `src/components/common`.
- Define shared colors, surface tokens, chart tokens, and timeline tokens in `src/styles/index.css` before using one-off values in JSX.
- Keep shared HTTP client setup in `src/lib` and feature-local transport in `src/features/<feature>/api`.
- Prefer `react-hook-form` with `zod` for validated forms unless the form is truly trivial.
- Keep code minimal, clean, clear, and maintainable.
- Avoid unnecessary wrappers, abstractions, and nested container structures.

## Workspace UI rules

- Authenticated product pages must use pane-based workspace layouts, not centered showcase canvases.
- Sidebars are structural navigation chrome, not floating hero cards.
- Production work surfaces must stay flatter and denser than preview/demo surfaces.
- Keep toolbars close to data surfaces; avoid large headers or summary-card stacks above core workflows unless explicitly requested.
- Prefer dividers, grid rhythm, and subtle background shifts over heavy shadows, glow, blur, or oversized rounded containers.
- Use small-to-moderate radii on workspace pages; reserve more expressive treatment for login or preview surfaces only.
- Avoid card-in-card-in-card layouts unless the nested hierarchy has a clear functional reason.
- Timeline/gantt pages should feel like operational review tools: sticky rails, stable headers, dense rows, minimal copy, semantic color.
- Avoid these anti-patterns on authenticated pages:
  - centered max-width app canvas
  - hero sections above work surfaces
  - stacked oversized cards wrapping the whole page
  - decorative atmospheric backgrounds competing with data
  - promotional/product-marketing copy inside workflow pages

## Skill routing

Load skills only when the task actually matches. Do not preemptively load every skill.

- Load skills lazily. Start with the narrowest matching skill, then load an additional skill only if the task expands.
- Prefer shared tokens, shared variants, and reusable compositions over one-off presentation values in JSX.
- For frontend work, put design system decisions into global theme tokens or reusable component classes before page-level usage.
- Do not load a skill just because it is relevant to the repo; load it only when it materially improves the current task.

- Load `frontend-design` for theme work, visual polish, typography, motion restraint, login styling, preview styling, and overall interface refinement. Do not use it alone to decide authenticated workspace structure.
- Load `enterprise-workspace-ui` for authenticated product shells, sidebars, dense dashboards, toolbar layouts, pane structures, and enterprise work surfaces. Let this skill own structure and density on authenticated pages.
- Load `react-architecture` when changing route structure, page composition, feature boundaries, state ownership, API-to-view-model mapping, or reusable React structure beyond cosmetic edits.
- Load `shadcn` when the task depends on shadcn primitives, registry lookup, CLI component install/update flows, or reusable component composition. Do not load it for overall product direction by itself.
- Load `timeline-gantt-ux` for milestone and bug timeline/gantt pages, timeline filters, sticky headers/rails, zoom ranges, and scan-heavy temporal layouts. Pair with `enterprise-workspace-ui` when the page shell also changes.
- Load `vercel-react-best-practices` when work touches render performance, async boundaries, bundle splitting, client/server tradeoffs, memoization, or expensive dashboard interactions.
- Load `frontend-quality-gates` only after implementation work, when verifying the final result before handoff or commit. Do not use it during active editing.
- Load `git-commit` only when the user explicitly asks for a commit.
- Load `minimal-product-copy` when writing or revising UI labels, headings, helper text, button text, auth copy, empty states, or dashboard microcopy. Use it for text, not visual layout decisions.

### Skill-specific expectations

- `frontend-design`: use for theme/tokens/polish, minimal elegant usability, and non-workspace expressive surfaces; do not let it override workspace-density rules.
- `enterprise-workspace-ui`: default skill for authenticated pages; enforce Jira/Outlook/ChatGPT-like pane structure, compact spacing, operational hierarchy, and stable work-first layouts.
- `react-architecture`: use when creating or restructuring routes, moving logic into `src/features/*`, or defining auth/data boundaries.
- `shadcn`: use when a page needs primitives or compositions that should be solved with shadcn patterns instead of custom UI primitives, not as a substitute for product UX direction.
- `timeline-gantt-ux`: use for gantt/time-axis structure, row density, sticky headers, grouped rails, semantic bar styling, filter placement near results, and stable scan-heavy review ergonomics.
- `vercel-react-best-practices`: use when optimizing dense analytics screens, lazy loading heavy routes, or tuning interaction performance.
- `frontend-quality-gates`: use only during final verification; run the expected checks after implementation, not during active implementation.
- `git-commit`: use only on explicit user request, after the intended scope is already verified.
- `minimal-product-copy`: use when the interface needs restrained, literal wording with minimal explanation, no invented product claims, and no unnecessary subtitles or helper text.

## Subagent routing

- Use the `explore` subagent for broad repo discovery, codebase audits, or answering structural questions without edits.
- Use the `general` subagent for parallelizable multi-step research or implementation support.

## UX priorities for this repo

- Light theme must maintain strong contrast and avoid beige, brown, or lifestyle-brand cues.
- Timeline and gantt surfaces should feel stable, operational, and easy to scan in review meetings.
- Filters and controls should avoid layout shift and feel persistent.
- Use color semantically for status, risk, and severity; do not rely on color alone to convey meaning.
- Authenticated pages should feel closer to Jira, Outlook Web, and ChatGPT shells than to marketing pages or dashboard mockups.
