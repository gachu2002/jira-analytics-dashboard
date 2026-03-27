---
name: shadcn
description: Manages shadcn components and projects - adding, searching, fixing, debugging, styling, and composing UI. Applies when working with shadcn/ui, registries, presets, or any project with a `components.json` file.
user-invocable: false
---

# shadcn/ui

A framework for building ui, components and design systems. Components are added as source code to the user's project via the CLI.

> **IMPORTANT:** Run all CLI commands using the project's package runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest` - based on the project's `packageManager`. Examples below use `npx shadcn@latest` but substitute the correct runner for the project.

## Current Project Context

```json
!`npx shadcn@latest info --json`
```

The JSON above contains the project config and installed components. Use `npx shadcn@latest docs <component>` to get documentation and example URLs for any component.

## Principles

1. **Use existing components first.** Use `npx shadcn@latest search` to check registries before writing custom UI. Check community registries too.
2. **Compose, don't reinvent.** Settings page = Tabs + Card + form controls. Dashboard = Sidebar + Card + Chart + Table.
3. **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`, etc.
4. **Use semantic colors.** `bg-primary`, `text-muted-foreground` - never raw values like `bg-blue-500`.

## Repository Enforcement

- **Always prefer shadcn components whenever a suitable option exists.** Before building custom UI, check whether the need can be solved by an existing shadcn component or by composing multiple shadcn primitives.
- **Do not create custom UI primitives when shadcn composition is sufficient.** Only fall back to custom markup when there is no reasonable shadcn pattern for the requirement.
- **Favor reusable composition over duplication.** If the same UI pattern appears in 2 or more places, extract it into a shared reusable component instead of repeating the markup.
- **Define theme styling centrally first.** Colors, semantic tokens, and reusable styling primitives should be defined in the project's Tailwind/global style file before being consumed in components.
- **Avoid hardcoded presentation values in component code.** Prefer semantic tokens and shared variants over one-off color utilities and repeated ad-hoc class combinations.
- **Do not default to nested `Card` composition.** A `Card` inside another `Card` should have a clear information-architecture reason, not just visual layering.

## When not to load

- Do not load just because the repo contains shadcn components.
- Do not load for page layout, workspace structure, or design direction by itself; use `enterprise-workspace-ui` and/or `frontend-design`.
- Do not load for copy changes, routing, state ownership, or API/view-model work.
- Load this skill when the task depends on shadcn primitives, registries, CLI workflows, or reusable component composition.

## Critical Rules

### Styling & Tailwind -> `rules/styling.md`

- **Prefer semantic tokens and variants before one-off styling.**
- **No `space-x-*` or `space-y-*`.** Use `flex` with `gap-*`.
- **Use `size-*` when width and height are equal.** `size-10` not `w-10 h-10`.
- **Use `truncate` shorthand.** Not `overflow-hidden text-ellipsis whitespace-nowrap`.
- **No manual `dark:` color overrides.** Use semantic tokens.
- **Use `cn()` for conditional classes.** Don't write manual template literal ternaries.
- **Avoid overlay z-index overrides unless the component stack actually requires it.**

### Forms & Inputs -> `rules/forms.md`

- Prefer established shadcn form composition when the repo already has the needed primitives.
- Use accessible validation states and labels.
- Prefer reusable field/group patterns once the same form structure repeats.

### Component Structure -> `rules/composition.md`

- **Use `asChild` (radix) or `render` (base) for custom triggers.** Check the `base` field from `npx shadcn@latest info`.
- **Dialog, Sheet, and Drawer always need a Title.**
- **Use full Card composition.** `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.
- **Avoid recursive card stacking unless the nested card carries distinct scope or function.**
- **`TabsTrigger` must be inside `TabsList`.**
- **`Avatar` always needs `AvatarFallback`.**

### Use Components, Not Custom Markup

- **Use existing components before custom markup.**
- **Always check for a shadcn-fit first.** If `Button`, `Card`, `Alert`, `Badge`, `Tabs`, `Table`, `Dialog`, `Sheet`, `Separator`, `Skeleton`, `Empty`, or another shadcn primitive can cover the need, use it.
- **Callouts use `Alert`.**
- **Empty states use `Empty`.**
- **Toast via `sonner`.**
- **Use `Separator`** instead of raw separators.
- **Use `Skeleton`** for loading placeholders.
- **Use `Badge`** instead of custom styled spans.

### Icons -> `rules/icons.md`

- Keep icon usage consistent with installed primitives and existing repo patterns.
- Prefer semantic placement and restrained sizing over decorative icon treatment.

### CLI

- **Never decode or fetch preset codes manually.** Pass them directly to `npx shadcn@latest init --preset <code>`.

## Key Patterns

```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>

<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

<div className="flex flex-col gap-4" />
<Avatar className="size-10" />
<Badge variant="secondary">+20.1%</Badge>
```

## Component Selection

- Button/action -> `Button`
- Form inputs -> `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `InputOTP`, `Slider`
- Toggle between 2-5 options -> `ToggleGroup` + `ToggleGroupItem`
- Data display -> `Table`, `Card`, `Badge`, `Avatar`
- Navigation -> `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination`
- Overlays -> `Dialog`, `Sheet`, `Drawer`, `AlertDialog`
- Feedback -> `sonner`, `Alert`, `Progress`, `Skeleton`, `Spinner`
- Charts -> `Chart` wrapping Recharts
- Empty states -> `Empty`

## Key Fields

- **`aliases`** -> use the actual alias prefix for imports.
- **`isRSC`** -> when true, client-only React features need `"use client"`.
- **`tailwindVersion`** -> v4 uses `@theme inline`; v3 uses `tailwind.config.js`.
- **`tailwindCssFile`** -> always edit the existing global CSS file.
- **`style`** -> the current component visual treatment.
- **`base`** -> primitive library (`radix` or `base`).
- **`iconLibrary`** -> determines icon imports.
- **`resolvedPaths`** -> exact component/utils/hooks destinations.
- **`framework`** -> routing and file conventions.
- **`packageManager`** -> use this for dependency commands.

## Workflow

1. Get project context with `npx shadcn@latest info --json`.
2. Check installed components before adding new ones.
3. Search registries with `npx shadcn@latest search` before writing custom markup.
4. If existing installed primitives are enough, compose them before adding new ones.
5. If a pattern is used in 2 or more places, extract a reusable component in the appropriate shared location.
6. Define any new colors or semantic tokens in the global Tailwind/theme file before using them in component code.
7. Fetch docs first with `npx shadcn@latest docs <component>`.
8. Install or update with `npx shadcn@latest add`.
9. Review added files and adapt them to repo conventions.
10. Never guess the registry when the user asks for a block or component.
11. For preset switching, ask whether to reinstall, merge, or skip.

## Updating Components

When the user asks to update a component while keeping local changes:

1. Run `npx shadcn@latest add <component> --dry-run`.
2. Run `npx shadcn@latest add <component> --diff <file>` per affected file.
3. Merge upstream changes carefully instead of blindly overwriting.
4. Never use `--overwrite` without explicit approval.

## Quick Reference

```bash
npx shadcn@latest init --preset base-nova
npx shadcn@latest init --name my-app --preset a2r6bw --template vite
npx shadcn@latest add button card dialog
npx shadcn@latest add button --dry-run
npx shadcn@latest search @shadcn -q "sidebar"
npx shadcn@latest docs button dialog select
npx shadcn@latest view @shadcn/button
```
