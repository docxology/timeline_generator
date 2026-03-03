# Architecture

## System Overview

```
┌────────────────────────────────────────────────────────────┐
│                    Browser (React + D3)                      │
│  ┌──────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ Left     │  │  Graph Canvas   │  │  Right Panel     │   │
│  │ Panel    │  │  (D3 Force)     │  │  (Detail View)   │   │
│  │          │  ├─────────────────┤  │                  │   │
│  │ Search   │  │  Timeline       │  │  Person/Edge     │   │
│  │ Layer    │  │  (SVG Brush)    │  │  Inspector       │   │
│  │ Toggles  │  │                 │  │                  │   │
│  └──────────┘  └─────────────────┘  └──────────────────┘   │
│                     │ Zustand Store │                        │
└─────────────────────┼───────────────┼───────────────────────┘
                      │ fetch /api/*  │
                      ▼               ▼
┌────────────────────────────────────────────────────────────┐
│                  Backend (Fastify + Node)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Route Handlers                          │   │
│  │  /persons  /edges  /graph/full  /timeline  /research  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │ IGraphStore interface               │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │              Neo4jStore (Cypher Queries)               │   │
│  │  MATCH · CREATE · MERGE · shortestPath · UNWIND       │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │ Bolt Protocol                       │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │            Neo4j Graph Database (Docker)               │   │
│  │  :Person · :Event · typed relationships · APOC         │   │
│  │  Ports: 7474 (Browser) · 7687 (Bolt)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Shared Types (shared package)                │   │
│  │  TypeScript Interfaces · Zod Schemas · Constants       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

The project uses **pnpm workspaces** with four packages:

| Package | Purpose | Dependencies |
|---|---|---|
| `shared` | Types, schemas, constants | `zod` |
| `seed-data` | Initial Fuller network data | `shared` |
| `backend` | REST API server + Neo4j | `shared`, `seed-data`, `fastify`, `neo4j-driver` |
| `frontend` | Browser visualization | `shared`, `react`, `d3`, `zustand` |

### Dependency Graph

```
frontend ──→ shared
backend ──→ shared ──→ zod
        ──→ seed-data ──→ shared
        ──→ neo4j-driver (Bolt)
```

## Data Flow

1. **Startup**: Server initializes Neo4j driver, applies uniqueness constraints, and hydrates seed data if the database is empty
2. **Store Injection**: `Neo4jStore` is injected as the active `IGraphStore` implementation
3. **API Request**: Frontend fetches `/api/graph/full` on mount
4. **Cypher Execution**: Route handlers call `IGraphStore` methods → `Neo4jStore` executes Cypher queries via Bolt
5. **State**: Zustand stores hold persons, edges, and UI state client-side
6. **Rendering**: D3 force simulation renders nodes and edges on SVG canvas
7. **Interaction**: User clicks/hovers update Zustand → D3 re-renders
8. **Filtering**: Layer toggles and confidence slider filter edges via `useMemo`
9. **Timeline**: Brush selection updates `timeWindowStart/End` → edges re-filter

## Key Design Decisions

### Neo4j Graph Database

All data is persisted in a Neo4j graph database running via Docker:

- **Persons** stored as `:Person` nodes with all metadata as properties
- **Edges** stored as typed relationships (e.g., `-[:COLLABORATED_WITH]->`) with `id`, `confidence`, `direction`, `startDate`, `endDate`, and `description`
- **Events** stored as `:Event` nodes linked to persons via `-[:HAS_EVENT]->`
- **Nested objects** (arrays, affiliations) are JSON-serialized as string properties and deserialized on read
- **Uniqueness constraints** on `Person.id` and `Event.id` enforced at the schema level
- **Seed data** automatically inserted on first boot if the database is empty

### IGraphStore Interface

A strict TypeScript interface (`IGraphStore`) defines the contract for all storage operations. The `Neo4jStore` class implements this with optimized Cypher queries. Routes interact only with the interface, never directly with the database driver.

### D3 Force Simulation over Canvas

SVG rendering provides individual element interactivity, CSS-styleable elements, and smooth React lifecycle integration. For larger graphs (1000+ nodes) a Canvas/WebGL upgrade path is available.

### Zustand over Redux

Chosen for minimal boilerplate, strong TypeScript inference, simple reactive selectors, and no provider wrapping.

### ESM Throughout

All packages use `"type": "module"` for native ES module support. The backend runs via `tsx` which handles TypeScript compilation inline.

## Visual Reference

![Main graph view](./assets/screenshot_graph.png)

See the [root README](../README.md) for full screenshots and demo recordings.
