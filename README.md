<div align="center">

# Timeline Generator

**Networked Life Encoding for People, Ideas, and Civilizational Threads**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-black?style=flat-square&logo=fastify)](https://www.fastify.io/)
[![D3.js](https://img.shields.io/badge/D3.js-7.x-F9A03C?style=flat-square&logo=d3.js&logoColor=white)](https://d3js.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.x-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Tests](https://img.shields.io/badge/tests-204_passing-brightgreen?style=flat-square)](docs/testing.md)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

An open, browser-native knowledge graph that encodes human lives as first-class temporal objects and weaves them into richly typed relational networks.

</div>

---

## 📸 Screenshots

<div align="center">

### Force-Directed Knowledge Graph with Edge Type Labels

<img src="docs/assets/screenshot_graph.png" alt="Main graph view with edge type labels, person list, and timeline" width="100%" />

### Person Detail Panel & Edge Inspector

<table>
<tr>
<td width="50%"><img src="docs/assets/screenshot_person_detail.png" alt="Person detail panel showing R. Buckminster Fuller biography" width="100%" /></td>
<td width="50%"><img src="docs/assets/screenshot_edge_inspector.png" alt="Edge inspector showing COLLABORATED WITH relationship" width="100%" /></td>
</tr>
<tr>
<td align="center"><em>Person detail with biography, events, and relationships</em></td>
<td align="center"><em>Edge inspector with type, confidence, and description</em></td>
</tr>
</table>

### AI-Powered Research with Enrich Existing Entities

<table>
<tr>
<td width="50%"><img src="docs/assets/screenshot_research_new.png" alt="Research modal - New Person search via Perplexity AI" width="100%" /></td>
<td width="50%"><img src="docs/assets/screenshot_research_enrich.png" alt="Research modal - Enrich existing person dropdown" width="100%" /></td>
</tr>
<tr>
<td align="center"><em>Search and add new historical figures via Perplexity AI</em></td>
<td align="center"><em>Enrich existing persons with additional research data</em></td>
</tr>
</table>

</div>

## 🎬 Demo

<div align="center">

<img src="docs/assets/demo_ui_improvements.webp" alt="UI improvements demo walkthrough" width="100%" />

<em>Live walkthrough showing edge labels, hover effects, research enrich tab, and date display improvements</em>

</div>

---

## 📖 Vision & Strategic Intent

Where conventional biography treats a person's life as a linear text, Timeline Generator treats it as a node in a multidimensional graph — alive with dated events, weighted relationships, epistemic provenance, and searchable context drawn from live information sources.

Beginning with a seed network around **R. Buckminster Fuller**, the system expands outward through time and association: Who knew of whom? Who corresponded? Who built on whose ideas? Who shared an institution, however briefly, before diverging?

## ✨ Features

- **Interactive Force-Directed Graph** — Fluid, physics-based D3 visualization of complex human networks with domain-colored nodes and confidence rings
- **Edge Type Labels** — Relationship types displayed directly on graph edges, with hover highlighting and angle-following rotation
- **Temporal Brushing** — Interactive SVG timeline to filter relationships and nodes by specific date ranges
- **Rich Biographical Entities** — Every node contains granular details — births, deaths, domains, and 12 types of temporal events
- **24 Typed, Weighted Edges** — Full relationship taxonomy (Epistemic, Collaboration, Pedagogical, Family, etc.) with epistemic confidence floors
- **Perplexity-Powered Research** — Built-in LLM integration to automatically research new figures, enrich existing profiles, and inject them into the active graph
- **Enrich Existing Entities** — Searchable dropdown of all graph persons for targeted AI-powered profile enrichment
- **Glassmorphic UI Engine** — Sleek Black, White, Gray, and Red aesthetic with accessible, responsive control panels
- **Neo4j Graph Database** — Persistent Cypher-backed storage with BFS traversal, shortest path, and APOC algorithms
- **Smart Date Display** — Intelligent year formatting that collapses same-year ranges (no more "1941–1941")

## 🏗️ Architecture

Built as a modern, ESM-native monorepo using `pnpm workspaces` with a Neo4j graph database backend.

```text
timeline_generator/
├── packages/
│   ├── shared/        # Isomorphic constraints, Zod schemas, Edge taxonomy
│   ├── seed-data/     # The Buckminster Fuller historical dataset (20 persons, 42 edges, 46 events)
│   ├── backend/       # Fastify REST API + Neo4j Graph Database (IGraphStore → Neo4jStore)
│   └── frontend/      # React + Zustand + D3 Graph and SVG Timeline
├── docs/              # Comprehensive documentation (15 files)
├── docker-compose.yml # Neo4j service definition
└── run.sh             # All-in-one orchestrator script
```

See the [Architecture Guide](docs/architecture.md) for the full system design, data flow, and key design decisions.

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+
- **pnpm** v9+ (`corepack enable pnpm`)
- **Docker** — for Neo4j graph database
- **Perplexity API Key** _(optional)_ — for research features, set `PERPLEXITY_API_KEY` in `packages/backend/.env`

### Quick Start

```bash
# 1. Clone and install
git clone https://github.com/docxology/timeline_generator.git
cd timeline_generator
pnpm install

# 2. Start Neo4j
docker compose up -d

# 3. Launch everything
pnpm dev

# Or use the all-in-one orchestrator (installs, tests, launches):
./run.sh
```

The application will be available at:

- **Frontend** (UI): `http://localhost:5173`
- **Backend** (API): `http://localhost:3001`
- **Neo4j Browser**: `http://localhost:7474`

See the [Getting Started Guide](docs/getting-started.md) for detailed setup instructions.

## 📚 Documentation

All aspects of the system are documented in the [`/docs`](docs/README.md) directory:

| Document | Description |
|---|---|
| [Getting Started](docs/getting-started.md) | Installation, setup, and first run |
| [Architecture](docs/architecture.md) | System design, monorepo structure, data flow |
| [Data Model](docs/data-model.md) | 24 relationship types, 12 event types, confidence tiers |
| [API Reference](docs/api-reference.md) | 18 REST endpoints with examples |
| [Research](docs/research.md) | Perplexity AI research and entity enrichment |
| [Frontend Guide](docs/frontend-guide.md) | React components, D3 visualization, Zustand state |
| [Backend Guide](docs/backend-guide.md) | Fastify server, Neo4j store, route handlers |
| [Configuration](docs/configuration.md) | Environment variables, Docker, TypeScript, Vite |
| [Seed Data](docs/seed-data.md) | Fuller network dataset specification |
| [Testing](docs/testing.md) | 204-test suite across 4 packages |
| [Contributing](docs/contributing.md) | Code style, PR process, development workflow |
| [Roadmap](docs/roadmap.md) | Completed phases and future plans |
| [Glossary](docs/glossary.md) | Domain terminology and definitions |

## 🧪 Testing

Robust test coverage across the entire stack — **204 tests, all passing**.

```bash
# Run the entire test suite
pnpm test

# Or via the orchestrator
./run.sh --test-only
```

| Package | Tests | Coverage |
|---|---|---|
| `shared` | 72 | Zod schemas, constants, barrel exports |
| `seed-data` | 28 | Referential integrity, schema validation |
| `backend` | 104 | Store CRUD, graph algorithms, route handlers, research/enrichment |
| **Total** | **204** | |

Tests use an in-memory `MemoryStore` for speed — no Neo4j instance required.

## 🤝 Contributing

We welcome contributions! Please review our [Contribution Guidelines](docs/contributing.md) before submitting a pull request.

We maintain a strict **Zero-Mock** policy for tests and require comprehensive JSDoc annotations for all newly added methods.

## 🎨 Design Philosophy

No blue. The interface strictly adheres to a monochromatic deep-space aesthetic (Slate grays from `slate-50` to `slate-950`), accented only by vital systemic highlights in structural **Red** (`#DC2626`). Interfaces are glassy, non-obtrusive, and map dynamically to the complexity of the data they project.

---

<div align="center">
  <sub>Built for the exploration of networked human intellectual history.</sub>
</div>
