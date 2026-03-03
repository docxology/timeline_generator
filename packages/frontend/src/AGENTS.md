# AGENTS.md — frontend/src/

Vite-based React SPA. Everything renders inside `App.tsx`.

- `main.tsx` mounts `<App />` and adds the `dark` class to `<html>`
- `index.css` defines all design tokens as CSS custom properties
- Components read from Zustand stores; never call API directly (use `api/client.ts`)
- D3 visualizations (`graph/`, `timeline/`) use imperative D3 inside `useEffect`
- Theme is Black/Gray/White/Red — search for hex values if adding colors
