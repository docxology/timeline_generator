# Frontend Guide

The frontend is a React single-page application with D3.js for graph visualization, Zustand for state management, and Tailwind CSS for styling.

## Component Architecture

```
App.tsx
├── LeftPanel
│   ├── Search input
│   ├── Person list (filtered, clickable)
│   └── LayerPanel
│       ├── Layer presets (All, Intellectual, Social, ...)
│       ├── Category toggles (with color swatches)
│       └── Confidence floor slider
├── GraphCanvas (D3 force-directed SVG)
│   ├── Edge rendering with type labels
│   └── Node rendering with domain colors
├── Timeline (D3 SVG with brush)
├── RightPanel
│   ├── Person detail (bio, occupations, events, relationships)
│   └── Edge inspector (type, strength, confidence)
└── ResearchPanel (modal)
    ├── New Person tab (Perplexity search)
    └── Enrich Existing tab (dropdown + enrichment)
```

## Core Components

### `App.tsx`

Main layout orchestrator. Handles:

- Data fetching from `/api/graph/full` on mount
- Three-panel layout with collapsible sides
- Auto-opening right panel on selection
- Loading and error states with branded animations
- ResizeObserver for responsive D3 dimensions
- Dark mode toggle
- Research modal toggle

### `graph/GraphCanvas.tsx`

The D3 force-directed graph visualization. Key features:

- **Force simulation** with link, charge, center, collision, and position forces
- **Domain-colored nodes** — circle radius scales with edge degree
- **Confidence ring** — outer ring with dashed line for approximate dates
- **Edge rendering** — colored by category, width by strength, dashed for low confidence
- **Edge type labels** — relationship type text at edge midpoints, rotated to follow edge angle, with hover visibility
- **Edge hover effects** — stroke thickens and opacity increases on mouseenter
- **Smart date labels** — same-year birth/death collapses to single year (no "1941–1941")
- **Interaction** — click to select, hover to highlight, drag to reposition
- **Gold glow selection** — selected node gets a gold (#FFD700) SVG glow filter, gold dashed selection ring with pulse animation, and gold stroke on the main circle
- **Zoom/Pan** — d3-zoom with scroll and drag

### `timeline/Timeline.tsx`

SVG timeline with:

- **Lifespan bars** — horizontal bars from birth year to death year (or present)
- **Domain coloring** — bars match person's primary domain
- **Decade gridlines** — subtle reference lines
- **d3-brush** — drag to select a time window, which filters the graph edges
- **Name labels** — abbreviated names next to bars when space allows
- **Click interaction** — click a bar to select the person

### `components/LeftPanel.tsx`

Left sidebar containing:

- Text search input with clear button
- Filtered person list with domain color dots and date ranges
- LayerPanel for edge type toggling

### `components/RightPanel.tsx`

Detail panel with three modes:

1. **Person Detail** — full biography, occupations, affiliations, temporal events, relationships list, tags, external links. Dates display uses smart formatting (same-year collapse). Events with null dates show `?`.
2. **Edge Inspector** — type badge, source→target, description, dates (with same-year collapse), confidence and strength bars, tags
3. **Empty State** — prompt to select a node or edge

The component is wrapped in `RightPanelErrorBoundary` which catches render errors (e.g. from incomplete Perplexity data) and displays a recovery UI with "Try again" instead of a blank screen.

The Person Detail mode also includes a **✨ Enrich Profile** button that triggers Perplexity AI enrichment directly from the detail panel without opening the Research modal.

![Person detail panel](./assets/screenshot_person_detail.png)

### `components/ResearchPanel.tsx`

Modal overlay for AI-powered research. Features two tabs:

1. **🔍 New Person** — search input for Perplexity AI queries, displays structured results (bio, connections, events, citations), and "Add to Graph" button
2. **✨ Enrich Existing** — searchable dropdown of all graph persons, select a person and click "Enrich" to augment their profile with additional Perplexity research

When a new-person search finds someone already in the graph, the panel offers an **"✨ Enrich Their Profile"** button for seamless enrichment.

The backend passes all existing person canonical names into the Perplexity prompt so that `suggestedEdges` target names precisely match graph nodes. This ensures that newly researched or enriched nodes integrate into the network with proper typed edges.

![Research modal — New Person](./assets/screenshot_research_new.png)

### `components/LayerPanel.tsx`

Edge layer controls:

- Preset buttons (All, Intellectual, Social, Family, Institutional, Conflicts)
- Grouped toggle buttons with color swatches and edge counts
- Confidence floor range slider

## State Management

### `store/graphStore.ts` (Zustand)

| State | Type | Description |
|---|---|---|
| `persons` | `Person[]` | All persons from API |
| `edges` | `Edge[]` | All edges from API |
| `events` | `TemporalEvent[]` | Events for selected person |
| `loading` | `boolean` | Data loading state |
| `error` | `string \| null` | Error message |
| `selectedPersonId` | `string \| null` | Currently selected person |
| `selectedEdgeId` | `string \| null` | Currently selected edge |
| `hoveredPersonId` | `string \| null` | Currently hovered person |
| `visibleCategories` | `Record<EdgeCategory, boolean>` | Layer toggle state |
| `confidenceFloor` | `number` | Minimum confidence threshold |
| `timeWindowStart` | `number \| null` | Timeline brush start year |
| `timeWindowEnd` | `number \| null` | Timeline brush end year |
| `searchQuery` | `string` | Search input text |

### `store/uiStore.ts` (Zustand)

| State | Type | Description |
|---|---|---|
| `darkMode` | `boolean` | Dark/light mode toggle |
| `leftPanelOpen` | `boolean` | Left panel visibility |
| `rightPanelOpen` | `boolean` | Right panel visibility |

## Edge Filtering Pipeline

Edge filtering happens in `GraphCanvas` via `useMemo`:

1. **Category filter** — each edge is mapped to its `EdgeCategory` via `EDGE_TYPE_TO_CATEGORY`
2. **Confidence filter** — edges below `confidenceFloor` are hidden
3. **Time window filter** — edges outside the brushed time range are hidden
4. **Result** — only visible edges drive the D3 force simulation

## API Client

`api/client.ts` provides typed fetch wrappers:

```typescript
import { api } from './api/client';

const graph = await api.getFullGraph();     // { nodes, links }
const person = await api.getPerson('bucky-fuller');
const events = await api.getPersonEvents('bucky-fuller');
const path = await api.findPath('bucky-fuller', 'john-cage');
const research = await api.research('Nikola Tesla', true);
const enriched = await api.enrichPerson('bucky-fuller');
```

## Styling

- **Tailwind CSS** with custom config for `surface` color palette, `accent` color, and animations
- **CSS custom properties** for dark/light theme (`--graph-bg`, `--panel-bg`, `--text-primary`, etc.)
- **Glassmorphism** panels with `backdrop-filter: blur()`
- **Grid background** pattern on the graph area
- **Custom scrollbars** with thin styling
