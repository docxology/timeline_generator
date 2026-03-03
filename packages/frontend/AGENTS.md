# AGENTS.md — frontend

React + D3 + Zustand SPA. Depends on `shared` for types and constants.

## Conventions

- Every `.tsx` component has `@module` + `@description` JSDoc
- All interactive elements have `aria-label` or ARIA roles
- Decorative icons use `aria-hidden="true"`
- Dynamic colors (domain/edge) use inline `style` — this is intentional
- Zustand stores are in `store/`, separated by concern (graph vs UI)
- API calls go through `api/client.ts`, never raw `fetch`
- Theme: Black/Gray/White/Red only — no blue anywhere

## State Architecture

| Store | Responsibility |
|-------|---------------|
| `graphStore` | Data (persons, edges), selection, filters, computed selectors |
| `uiStore` | Dark mode, panel open/close state |

## Component Hierarchy

```
App
├── LeftPanel
│   └── LayerPanel
├── GraphCanvas (D3)
├── Timeline (D3)
├── RightPanel (person detail / edge inspector)
└── ResearchPanel (modal overlay)
```
