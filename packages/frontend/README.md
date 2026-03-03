# @timeline-generator/frontend

React SPA with D3 force-directed graph, SVG timeline, and Perplexity research panel.

## Architecture

```
src/
├── App.tsx              # Root layout: 3-panel + toolbar + modal
├── main.tsx             # React root mount
├── index.css            # Design system (CSS vars, components, utilities)
├── api/
│   └── client.ts        # 16-method API client (fetchJSON wrapper)
├── components/
│   ├── LeftPanel.tsx     # Person directory, search, layer controls
│   ├── RightPanel.tsx    # Person detail + edge inspector
│   ├── ResearchPanel.tsx # Perplexity research modal
│   └── LayerPanel.tsx    # Edge category toggles + confidence slider
├── graph/
│   └── GraphCanvas.tsx   # D3 force-directed graph (SVG)
├── store/
│   ├── graphStore.ts     # Zustand: persons, edges, selection, filters
│   └── uiStore.ts        # Zustand: dark mode, panel visibility
└── timeline/
    └── Timeline.tsx      # SVG lifespan bars + D3 brush time filter
```

## Theme

Black, Gray, White, Red — no blue. All color tokens defined in `index.css` custom properties.

## Running

```bash
pnpm --filter frontend dev     # Vite dev server on port 5173
pnpm --filter frontend build   # Production build
```

## Key Features

- **Force graph**: Drag, hover, click-to-select, zoom/pan, domain-colored nodes
- **Timeline**: Lifespan bars, brush-based time window filtering
- **Research modal**: Escape key, auto-focus, Perplexity search with add-to-graph
- **Layer system**: 10 edge categories, 6 presets, confidence floor slider
- **Accessibility**: aria-labels, role="dialog", keyboard navigation
- **Enrich Profile**: One-click ✨ button in RightPanel for direct Perplexity enrichment
- **Gold selection glow**: Selected node gets animated gold (#FFD700) ring
