# frontend/src/

Frontend source directory. Entry point: `main.tsx` → `App.tsx`.

| File/Dir | Description |
|----------|-------------|
| `main.tsx` | React root mount |
| `App.tsx` | Root layout: 3-panel + toolbar + modal |
| `index.css` | Design system (CSS vars, components, scrollbar, animations) |
| `api/` | API client (`client.ts`) — 16 typed methods |
| `components/` | LeftPanel, RightPanel, ResearchPanel, LayerPanel |
| `graph/` | GraphCanvas — D3 force-directed visualization |
| `store/` | Zustand stores (graphStore + uiStore) |
| `timeline/` | Timeline — SVG lifespan bars + D3 brush |
