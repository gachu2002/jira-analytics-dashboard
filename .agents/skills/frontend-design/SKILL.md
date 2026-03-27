---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
user-invocable: false
---

This skill is based on Anthropic's `frontend-design` skill. The upstream text is preserved unchanged in `ANTHROPIC_SKILL.md`. The instructions below keep that foundation and add repo-local guidance for this workspace.

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Repo-Local Addendum

Use this addendum with the Anthropic guidance above when working in this repository.

### Scope Boundaries

- Use this skill for visual system work: theme direction, tokens, typography, polish, component finish, motion restraint, and overall design refinement.
- Use it for color systems and theme tokens, typography choices and hierarchy, component polish and visual consistency, login/auth surface styling, preview/lab surfaces, and final visual refinement of dashboards and timelines.
- Do not use this skill alone to decide authenticated workspace structure. For authenticated product pages, pair or defer to `enterprise-workspace-ui`.
- Do not load for route/state/data-flow refactors; use `react-architecture`.
- Do not load only to rewrite labels or helper text; use `minimal-product-copy`.
- Do not load only to verify implementation; use `frontend-quality-gates`.

### Repo-Specific Posture

This repo is not a marketing site and not a Dribbble showcase.

When designing for this repository:

- Prefer Atlassian-adjacent enterprise clarity.
- Favor cool neutrals, disciplined blue emphasis, and semantic status color.
- Preserve strong contrast in light theme.
- Keep visual systems restrained enough for dense analytics and review meetings.
- Keep interfaces minimal, elegant, and easy to use.
- Make tracking, review, and orientation feel effortless.
- Optimize for comfort during long work sessions, not short visual impact.
- Remove visual or copy noise that does not help the task.

### Default References

Use these references heavily for authenticated product pages:

- Jira work management / timeline surfaces
- Outlook Web pane structure
- ChatGPT app-shell layout density

Use these references lightly for expressive surfaces:

- login page
- preview route

### Product-Specific Principles

- Define colors and semantics in the global theme file first.
- Promote reusable treatments into tokens or component variants.
- Avoid one-off raw values in JSX when a pattern could recur.
- Prefer simple flows and low-friction interaction.
- Reduce clicks, visual weight, and decision overhead where possible.
- Aim for interfaces that feel calm, polished, and immediately legible.
- Make dense product surfaces comfortable to scan for extended periods.
- If a decorative treatment does not improve clarity, remove it.
- Prefer crisp separators over stacked shadows.
- Prefer background shifts over atmospheric effects on workspace pages.
- Prefer compact type hierarchy over oversized headlines.
- Use expressive visuals sparingly and intentionally.
- Avoid nested card stacks unless they materially improve understanding.
- If one card contains another, the inner layer should have a clear functional reason such as comparison, scoped editing, or embedded detail.
- Use semantic color with disciplined mapping: blue for primary emphasis, teal/green for healthy or resolved states, amber for review or warning, red/coral for risk or failure, and neutral/slate for support states.
- Keep authenticated pages more operational than editorial.
- Use motion sparingly and never let it reduce scanability.

### Anti-Patterns For This Repo

Avoid these unless the user explicitly requests them:

- oversized hero sections on authenticated pages
- centered max-width app canvases
- stacked oversized cards around the whole page
- nested cards used only for decoration
- glassmorphism-heavy work surfaces
- decorative glow competing with data
- purple-on-white default AI styling
- promotional copy as layout filler

### Expected Output By Surface

#### Login

- Can be more polished and composed than authenticated pages.
- Must still remain restrained and literal.
- One clear focal form; minimal copy.

#### Preview route

- Can be a visual lab.
- May show richer system examples.
- Must not dictate looser patterns for production pages.

#### Authenticated pages

- Flat, structural, dense, operational.
- `enterprise-workspace-ui` owns structure and layout decisions here.
- Theme work should support utility first.
- Visual polish must not reduce information density.

### Done Criteria

The design is correct when:

- the page feels product-native rather than AI-generated
- layout supports the task before decoration
- the light theme stays high-contrast and boardroom-safe
- visual tokens feel coherent across login, preview, and work surfaces
- the interface feels simple, comfortable, and easy to use repeatedly
- tracking and review tasks feel easier after the change, not just prettier
