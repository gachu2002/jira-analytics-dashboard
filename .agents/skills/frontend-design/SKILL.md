---
name: frontend-design
description: Theme, polish, and visual system guidance for distinctive but production-ready UI.
user-invocable: false
---

# Frontend Design

Use this skill for visual system work: theme direction, tokens, typography, polish, component finish, motion restraint, and overall design refinement.

## Scope

Use for:

- color systems and theme tokens
- typography choices and hierarchy
- component polish and visual consistency
- login/auth surface styling
- preview/lab surfaces
- final visual refinement of dashboards and timelines

Do not use this skill alone to decide authenticated workspace structure. For authenticated product pages, pair or defer to `enterprise-workspace-ui`.

## Repo-specific posture

This repo is not a marketing site and not a Dribbble showcase.

When designing for this repository:

- Prefer Atlassian-adjacent enterprise clarity.
- Favor cool neutrals, disciplined blue emphasis, and semantic status color.
- Preserve strong contrast in light theme.
- Keep visual systems restrained enough for dense analytics and review meetings.

## Default references

Use these references heavily for authenticated product pages:

- Jira work management / timeline surfaces
- Outlook Web pane structure
- ChatGPT app-shell layout density

Use these references lightly for expressive surfaces:

- login page
- preview route

## Core principles

### 1. Theme before page styling

- Define colors and semantics in the global theme file first.
- Promote reusable treatments into tokens or component variants.
- Avoid one-off raw values in JSX when a pattern could recur.

### 2. Strong hierarchy, low ornament

- Prefer crisp separators over stacked shadows.
- Prefer background shifts over atmospheric effects.
- Prefer compact type hierarchy over oversized headlines.
- Use expressive visuals sparingly and intentionally.

### 3. Semantic color only

- Blue = primary emphasis
- Teal/green = healthy/resolved/safe
- Amber = warning/review/watch
- Red/coral = risk/blocker/failure
- Neutral/slate = supporting states

Color should clarify state, not decorate empty space.

### 4. Typography

- Use a serious, readable body font.
- Use a restrained display face only where it improves hierarchy.
- Keep authenticated pages more operational than editorial.
- Avoid giant display typography on work surfaces.

### 5. Motion

- Use motion sparingly.
- Prefer route/shell polish, reveal, and selection feedback.
- Avoid constant bar/list animation in dense timelines.
- Never let animation reduce scanability.

## Anti-patterns for this repo

Avoid these unless the user explicitly requests them:

- oversized hero sections on authenticated pages
- centered max-width app canvases
- stacked oversized cards around the whole page
- glassmorphism-heavy work surfaces
- decorative glow competing with data
- purple-on-white default AI styling
- promotional copy as layout filler

## Expected output by surface

### Login

- Can be more polished and composed than authenticated pages
- Must still remain restrained and literal
- One clear focal form; minimal copy

### Preview route

- Can be a visual lab
- May show richer system examples
- Must not dictate looser patterns for production pages

### Authenticated pages

- Flat, structural, dense, operational
- Theme work should support utility first
- Visual polish must not reduce information density

## Done criteria

The design is correct when:

- the page feels product-native rather than AI-generated
- layout supports the task before decoration
- the light theme stays high-contrast and boardroom-safe
- visual tokens feel coherent across login, preview, and work surfaces
