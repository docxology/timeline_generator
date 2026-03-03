# Glossary

Domain-specific terminology used throughout the Timeline Generator project.

## Graph Theory

| Term | Definition |
|---|---|
| **Node** | A vertex in the graph, representing a person |
| **Edge** | A connection between two nodes, representing a relationship |
| **Degree** | Number of edges connected to a node |
| **Ego Network** | The subgraph of a focal node and all nodes within N hops |
| **BFS** | Breadth-First Search — traversal algorithm used for shortest path and ego network |
| **Force-Directed Layout** | Graph layout algorithm using physical simulation (attraction/repulsion forces) |
| **Shortest Path** | The minimum number of hops between two nodes |

## Data Model

| Term | Definition |
|---|---|
| **Person** | A human individual represented as a node with biographical metadata |
| **Canonical Name** | The primary/standard name for a person |
| **Temporal Event** | A dated occurrence in someone's life (birth, publication, award, etc.) |
| **Edge Type** | The specific labeled relationship (e.g., `COLLABORATED_WITH`, `MENTORED`) |
| **Edge Category** | A grouping of edge types (e.g., Epistemic, Collaboration, Family) |
| **Confidence** | 0.0–1.0 score indicating epistemic certainty of a record |
| **Provenance** | The chain of sources and citations supporting a data point |
| **Focal Graph** | A saved, named view of the graph with specific filters and layout |

## Confidence Tiers

| Term | Range | Description |
|---|---|---|
| **Attested** | 0.9–1.0 | Backed by primary source documentation |
| **High** | 0.7–0.9 | Multiple secondary sources agree |
| **Moderate** | 0.5–0.7 | Single secondary source |
| **Low** | 0.3–0.5 | LLM inference, co-mention |
| **Speculative** | 0.0–0.3 | Hypothesis without evidence |

## UI Components

| Term | Definition |
|---|---|
| **Graph Canvas** | The main D3 SVG visualization area showing the force-directed graph |
| **Timeline** | The bottom SVG bar showing person lifespans and brush-selectable time range |
| **Layer** | A category of edges that can be toggled on/off (e.g., "Intellectual") |
| **Layer Preset** | A predefined set of visible layers (e.g., "All", "Social") |
| **Confidence Floor** | Minimum confidence threshold — edges below this are hidden |
| **Brush** | D3 interaction where dragging selects a time range on the timeline |
| **Glassmorphism** | UI design style using frosted-glass panels with backdrop blur |
| **Edge Type Label** | Text label displayed at an edge's midpoint showing the relationship type (e.g., "collaborated with"), rotated to follow the edge angle |
| **Smart Date Display** | Intelligent year formatting that shows just "1941" instead of "1941–1941" when birth and death years are the same |
| **Enrich** | The process of augmenting an existing person's data with additional Perplexity AI research |
| **ResearchPanel** | Modal overlay component with two tabs: "New Person" search and "Enrich Existing" dropdown |
| **Enrich Profile Button** | One-click button in the RightPanel that triggers Perplexity AI enrichment for the currently selected person without opening the Research modal |
| **normalizePersonData** | Backend helper function that ensures all required Person fields exist with sensible defaults before creating a new person in the graph |
| **Edge Integration** | The process of injecting existing node names into the Perplexity prompt so that suggested edges precisely match graph nodes by canonical name |

## Technical

| Term | Definition |
|---|---|
| **Monorepo** | Single repository containing multiple packages (shared, seed-data, backend, frontend) |
| **Workspace** | pnpm workspace — linked packages sharing a single `node_modules` |
| **Neo4j** | Graph database engine used for persistent storage of persons, edges, and events |
| **Cypher** | Neo4j's declarative graph query language (MATCH, CREATE, MERGE, etc.) |
| **Bolt** | Binary protocol used by the Neo4j driver to communicate with the database (port 7687) |
| **APOC** | Neo4j plugin library (Awesome Procedures on Cypher) providing extended graph algorithms |
| **IGraphStore** | TypeScript interface defining the async storage contract for all graph operations |
| **Neo4jStore** | Production implementation of IGraphStore using Cypher queries via Bolt |
| **Docker Compose** | Container orchestration tool used to provision the Neo4j database service |
| **Zustand** | Lightweight React state management library |
| **D3** | Data-Driven Documents — JavaScript library for SVG visualizations |
| **Fastify** | High-performance Node.js web framework |
| **Zod** | TypeScript-first runtime schema validation library |
| **ESM** | ECMAScript Modules — native JavaScript module system |
| **tsx** | TypeScript executor for Node.js (no separate build step) |
| **Vite** | Next-generation frontend build tool with fast HMR |
| **run.sh** | All-in-one orchestration script that handles preflight checks, testing, and server launch |
