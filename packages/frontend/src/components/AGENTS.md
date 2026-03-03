# AGENTS.md — frontend/src/components/

All components use `@module` JSDoc. Accessibility requirements:

- Close buttons: `aria-label`
- Toggle buttons: `aria-pressed`
- Modal: `role="dialog"` + `aria-modal` + `aria-labelledby`
- Decorative icons: `aria-hidden="true"`
- Form inputs: associated `<label>` or `aria-label`

Components read from Zustand stores via `useGraphStore(s => s.field)` selectors.
