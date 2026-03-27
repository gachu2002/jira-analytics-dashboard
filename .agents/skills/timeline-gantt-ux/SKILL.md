---
name: timeline-gantt-ux
description: Use for milestone and bug timeline/gantt pages, time-axis layouts, sticky rails, zoom ranges, and dense scan-heavy temporal UX.
user-invocable: false
---

# Timeline Gantt UX

Use this skill when building or refining timeline and gantt surfaces.

## Purpose

Enforce dense, stable, scan-heavy time-based interfaces for milestone and bug review workflows.

## Use for

- milestone gantt pages
- bug timeline pages
- sticky time headers
- grouped left rails
- zoom controls
- timeline filters close to results
- bar styling and temporal density

## When not to load

- Do not load for general app shell or sidebar layout without a timeline surface; use `enterprise-workspace-ui`.
- Do not load for pure theme/token polish without timeline behavior changes; use `frontend-design`.
- Do not load for data-flow or feature-boundary refactors; use `react-architecture`.

## Core rules

### 1. Time axis must be stable

- Keep the time header sticky.
- Keep time increments readable and consistent.
- Avoid jumpy layouts when filters or zoom change.

### 2. Left rail must be stable

- Keep project/group labels in a consistent rail.
- Use compact metadata, not verbose descriptions.
- Support collapse/expand without visual chaos.

### 3. Density over decoration

- Optimize for scanning many rows.
- Keep row heights tight.
- Use compact labels and concise metadata.
- Do not waste vertical space on timeline pages.

### 4. Bars must be semantic

- Color bars by meaningful status/health/risk.
- Keep bar shapes simple and legible.
- Do not overload bars with too much text.
- Preserve readability in low-quality projection or bad lighting.

### 5. Controls stay near the timeline

- Search, zoom, grouping, and reset controls belong immediately above the timeline.
- Avoid large introductory sections above the gantt.
- Prevent layout shift when controls update state.

## Interaction rules

- Sticky top header
- Sticky left rail when possible
- Predictable scroll behavior
- Clear selected row/bar state
- Compact detail reveal or tooltip, not giant interruptions

## Anti-patterns

- oversized summary cards above the timeline
- decorative headers pushing the gantt down
- sparse row spacing
- overly rounded, playful bar styling
- color use without semantic meaning
- unstable filters that move the chart layout

## Expected result

The page should feel like an operational review tool used in meetings, not a generic dashboard mockup.
