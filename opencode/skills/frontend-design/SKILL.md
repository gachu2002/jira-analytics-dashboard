# Frontend Design Skill

This skill defines senior product-design standards for implementing data-dense dashboard UI.

## 1) Visual Direction

- Default to refined utilitarian styling: dense, clear, technical, and deliberate.
- Use a strict token system for color, spacing, radius, and typography.
- Avoid decorative effects that reduce signal clarity (heavy shadows, noisy gradients, ornamental chrome).

## 2) Layout System

- Start with shell geometry first: sidebar, header, content gutter, max-content width.
- Use a 4pt spacing rhythm and keep spacing increments predictable.
- Prioritize scannability: top-level KPI strip, then primary charts, then supporting detail.
- Keep visual hierarchy stable across pages so users can compare states quickly.

## 3) Typography and Density

- Use monospaced typography for metrics and axis/table numbers.
- Use sans-serif body text for labels and explanatory metadata.
- Keep KPI values high-contrast and compact, with subordinate muted metadata.
- Maintain consistent letter spacing for tiny uppercase labels and table headers.

## 4) Data Visualization Standards

- Align chart palette semantics: good (green), risk (amber), bad (red), neutral/reference (muted), action (blue).
- Use restrained motion for chart reveal; preserve readability over flourish.
- Keep axis, tooltip, and legend styling consistent across chart types.
- Ensure annotations convey decision context, not decoration.

## 5) Table and Filter UX

- Keep table headers compact, uppercase, and low-contrast; body text readable and aligned by data type.
- Right-align all numeric values; use tabular numerals.
- Use alternating row surfaces and clear current-row emphasis.
- Collapse advanced filters by default and expand into readable, code-like detail when requested.

## 6) Responsive Behavior

- Define breakpoints by information architecture, not device marketing sizes.
- At medium widths, stack complex charts before shrinking them too far.
- At small widths, preserve readability first; reduce chrome and secondary controls.
- Prevent overflow in charts/tables and preserve touch target sizing.

## 7) Interaction and Feedback

- Prefer subtle, quick transitions (100-200ms) for hover and panel transitions.
- Use skeleton loading for dense data regions.
- Keep buttons clean: border/color transitions over depth effects.
- Provide immediate state feedback on filters, navigation, and threshold changes.

## 8) Design QA Checklist

- Are tokens used consistently with no hardcoded ad-hoc colors/spacings?
- Is hierarchy clear at first glance (headline -> KPI -> chart -> detail)?
- Do hover/focus/active states remain visible and consistent?
- Is the layout coherent and readable at all supported breakpoints?
- Is every element contributing to comprehension or action?
