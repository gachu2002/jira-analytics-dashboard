---
name: vercel-react-best-practices
description: React and Next.js performance optimization guide with prioritized rules across async, bundle, server, client, rendering, and JavaScript patterns.
user-invocable: false
---

# Vercel React Best Practices

Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel. Contains 64 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:

- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

1. **Eliminating Waterfalls** - CRITICAL - `async-`
2. **Bundle Size Optimization** - CRITICAL - `bundle-`
3. **Server-Side Performance** - HIGH - `server-`
4. **Client-Side Data Fetching** - MEDIUM-HIGH - `client-`
5. **Re-render Optimization** - MEDIUM - `rerender-`
6. **Rendering Performance** - MEDIUM - `rendering-`
7. **JavaScript Performance** - LOW-MEDIUM - `js-`
8. **Advanced Patterns** - LOW - `advanced-`

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use `Promise.all()` for independent operations
- `async-dependencies` - Use better-all for partial dependencies
- `async-api-routes` - Start promises early, await late in API routes
- `async-suspense-boundaries` - Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-dynamic-imports` - Use dynamic imports for heavy components
- `bundle-defer-third-party` - Load analytics/logging after hydration
- `bundle-conditional` - Load modules only when feature is activated
- `bundle-preload` - Preload on hover/focus for perceived speed

### 3. Server-Side Performance (HIGH)

- `server-auth-actions` - Authenticate server actions like API routes
- `server-cache-react` - Use `React.cache()` for per-request deduplication
- `server-cache-lru` - Use LRU cache for cross-request caching
- `server-dedup-props` - Avoid duplicate serialization in props
- `server-hoist-static-io` - Hoist static I/O to module level
- `server-serialization` - Minimize data passed to client components
- `server-parallel-fetching` - Restructure components to parallelize fetches
- `server-after-nonblocking` - Use non-blocking post-response work where supported

### 4. Client-Side Data Fetching (MEDIUM-HIGH)

- `client-swr-dedup` - Use a deduplicating fetch layer
- `client-event-listeners` - Deduplicate global event listeners
- `client-passive-event-listeners` - Use passive listeners for scroll
- `client-localstorage-schema` - Version and minimize localStorage data

### 5. Re-render Optimization (MEDIUM)

- `rerender-defer-reads` - Don't subscribe to state only used in callbacks
- `rerender-memo` - Extract expensive work into memoized components
- `rerender-memo-with-default-value` - Hoist default non-primitive props
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect` - Derive state during render, not effects
- `rerender-functional-setstate` - Use functional state updates for stable callbacks
- `rerender-lazy-state-init` - Pass function to `useState` for expensive values
- `rerender-simple-expression-in-memo` - Avoid memo for simple primitives
- `rerender-split-combined-hooks` - Split hooks with independent dependencies
- `rerender-move-effect-to-event` - Put interaction logic in event handlers
- `rerender-transitions` - Use `startTransition` for non-urgent updates
- `rerender-use-deferred-value` - Defer expensive renders to keep input responsive
- `rerender-use-ref-transient-values` - Use refs for transient frequent values
- `rerender-no-inline-components` - Don't define components inside components

### 6. Rendering Performance (MEDIUM)

- `rendering-animate-svg-wrapper` - Animate a wrapper, not the SVG element itself
- `rendering-content-visibility` - Use `content-visibility` for long lists
- `rendering-hoist-jsx` - Extract static JSX outside components
- `rendering-svg-precision` - Reduce SVG coordinate precision
- `rendering-hydration-no-flicker` - Prevent flicker for client-only data
- `rendering-hydration-suppress-warning` - Suppress expected mismatches intentionally
- `rendering-activity` - Use explicit show/hide activity patterns
- `rendering-conditional-render` - Use ternary, not `&&`, for conditionals
- `rendering-usetransition-loading` - Prefer `useTransition` for loading state
- `rendering-resource-hints` - Use resource hints for preloading
- `rendering-script-defer-async` - Use `defer` or `async` on scripts

### 7. JavaScript Performance (LOW-MEDIUM)

- `js-batch-dom-css` - Group CSS changes via classes or `cssText`
- `js-index-maps` - Build `Map` for repeated lookups
- `js-cache-property-access` - Cache object properties in loops
- `js-cache-function-results` - Cache function results in a module-level `Map`
- `js-cache-storage` - Cache storage reads
- `js-combine-iterations` - Combine multiple `filter`/`map` passes into one loop
- `js-length-check-first` - Check array length before expensive comparison
- `js-early-exit` - Return early from functions
- `js-hoist-regexp` - Hoist `RegExp` creation outside loops
- `js-min-max-loop` - Use loops for min/max instead of sort
- `js-set-map-lookups` - Use `Set`/`Map` for O(1) lookups
- `js-tosorted-immutable` - Use `toSorted()` for immutability
- `js-flatmap-filter` - Use `flatMap` to map and filter in one pass

### 8. Advanced Patterns (LOW)

- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-init-once` - Initialize app once per app load
- `advanced-use-latest` - Use latest-value refs for stable callbacks

## How to Use

Read individual rule files for detailed explanations and code examples when available, using a naming pattern like:

```text
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

Each rule file should contain:

- A brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Full Compiled Document

For the complete guide with all rules expanded, consult the upstream `AGENTS.md` in the source skill repository.
