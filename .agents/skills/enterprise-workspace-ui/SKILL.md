---
name: enterprise-workspace-ui
description: Use for authenticated product shells, sidebars, dense dashboards, pane layouts, and operational work surfaces.
user-invocable: false
---

# Enterprise Workspace UI

Use this skill for authenticated product pages and application chrome.

## Purpose

Enforce pane-based, enterprise-grade work surfaces that feel closer to Jira, Outlook Web, and ChatGPT than to a centered dashboard mockup.

## Use for

- app shells
- sidebars and navigation panes
- authenticated dashboards
- toolbar + content layouts
- dense review surfaces
- pages with persistent controls and data grids

## When not to load

- Do not load for login-only or preview-only styling; use `frontend-design`.
- Do not load only to change copy or labels; use `minimal-product-copy`.
- Do not load for feature boundaries, route structure, or state ownership; use `react-architecture`.
- Do not load alone for timeline-specific interaction and time-axis behavior; pair with `timeline-gantt-ux`.

## Layout references

Heavily reference:

- Jira timeline / work-management shells
- Outlook Web pane composition
- ChatGPT desktop app/web shell proportions

These references imply:

- viewport ownership
- pane-based structure
- minimal outer padding
- dense but readable controls
- stable navigation chrome

## Structural rules

### 1. The page must own the viewport

- Avoid centered showcase canvases.
- Avoid giant outer gutters.
- Use pane layout: navigation rail + main content.
- Let the content area behave like a workspace, not a card pile.

### 2. Sidebar is structural chrome

- Sidebar should read as a pane or rail.
- Do not style it as a floating hero card.
- Keep nav concise and stable.
- Use subtle active states, not flashy treatments.

### 3. Toolbar stays close to the work

- Place filters and controls directly above the data surface.
- Avoid summary-card stacks above the main workflow unless explicitly requested.
- Keep toolbars compact and persistent.

### 4. Flatten the surface hierarchy

- Prefer one strong workspace surface over nested cards.
- Use dividers, sticky headers, and background bands to organize content.
- Use shadows sparingly and lightly.
- Avoid card-in-card-in-card layouts on authenticated pages unless the nested structure is functionally necessary.
- Prefer sectioning, separators, and surface contrast before introducing another container layer.

### 5. Density matters

- Use compact spacing.
- Tighten row heights, nav spacing, and toolbar controls.
- Prefer readable density over airy showcase composition.

## Styling rules

- `frontend-design` owns theme polish, typography finish, and visual refinement.
- This skill owns structure, density, pane behavior, and toolbar placement.
- Small-to-moderate radii on authenticated pages.
- Strong dividers and subtle panel contrast.
- Minimal atmospheric backgrounds.
- Avoid blur-heavy, glassy, or overly rounded compositions.
- Use semantic color as a task cue, not page decoration.

## Anti-patterns

Do not create these on authenticated pages:

- centered max-width app canvas
- large hero headers above the work surface
- dashboard-summary card grids before the actual task surface
- card-in-card-in-card workspace layouts without clear information hierarchy
- floating sidebar cards
- decorative gradients competing with data
- stacked rounded containers wrapping each section

## Expected result

The UI should feel:

- structural
- operational
- compact
- deliberate
- stable during long work sessions

If the result looks like a landing page or demo page, it is wrong.
