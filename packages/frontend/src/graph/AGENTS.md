# AGENTS.md — frontend/src/graph/

GraphCanvas uses D3 imperatively inside a `useEffect` hook. The SVG is rendered by D3, not React.

- D3 simulation runs with charge, center, and collision forces
- Edge curves use quadratic Bézier paths
- Node colors come from `DOMAIN_COLORS` constant (never hardcoded)
- Selection ring uses CSS `--selection-ring` variable
