# AGENTS.md — frontend/src/store/

Zustand stores use the `create<State>((set, get) => ({...}))` pattern.

- State reads: `useGraphStore(s => s.field)` selector pattern
- State writes: `setField(value)` action methods
- Computed values: `getFilteredEdges()`, `getSelectedPerson()`, `getSelectedEdge()`
- `graphStore` and `uiStore` are intentionally separated to avoid coupling data and UI concerns
