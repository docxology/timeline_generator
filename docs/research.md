# Research Feature

## Overview

The Research feature enables Perplexity AI-powered biographical research directly from the Timeline Generator interface. Users can search for any historical figure, view structured results, and optionally add discovered persons, connections, and events to the knowledge graph. Existing persons can be enriched with additional research data.

## Architecture

```text
Frontend                      Backend                      External
┌─────────────┐    POST      ┌──────────────┐    HTTPS    ┌─────────────┐
│ ResearchPanel│──────────────│/api/research │─────────────│ Perplexity  │
│ (React modal)│    /research │ (Fastify)    │    Sonar    │ API         │
└─────────────┘              └──────────────┘    API      └─────────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │Neo4jStore│  (optional auto-add)
                              └──────────┘
```

## User Flows

### New Person Research

1. Click the red **Research** button in the top toolbar
2. The **🔍 New Person** tab is selected by default
3. Type a person's name (e.g., "Nikola Tesla") in the search input
4. Click **Research** or press Enter
5. View structured results: biography, connections, timeline events, citations
6. Click **Add to Graph** to create the person and their connections in the graph
7. If the person already exists, click **✨ Enrich Their Profile** to add new data

### Enrich Existing Person

1. Click the red **Research** button in the top toolbar
2. Click the **✨ Enrich Existing** tab
3. Use the filter input to narrow the dropdown list of existing persons
4. Click a person to select them
5. Click the **✨ Enrich [Person Name]** button
6. The Perplexity API enriches their profile with additional biographical data
7. The graph auto-refreshes with updated information

### Enrich from Right Panel

1. Click any person node in the graph to open the Right Panel
2. Click the **✨ Enrich Profile** button directly below the person’s details
3. The button shows a loading spinner while the Perplexity API is queried
4. On completion, the graph auto-refreshes with new edges, events, and profile data
5. The loading message correctly shows `Enriching [Person Name]…`

## API Endpoints

### `POST /api/research`

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `query` | string | ✅ | Person name to research |
| `addToGraph` | boolean | ❌ | Auto-add person + edges + events to graph |

### `POST /api/research/enrich/:id`

Enrich an existing person with additional Perplexity research data. Reuses the same structured prompt and auto-merges results into the existing person's profile.

**Enrichment updates:**

- `birthDate` / `deathDate` — filled if person has none (the prompt emphasizes date research)
- `bioSummary` / `primaryDomain` — filled if person has none
- `occupations` — new occupations merged (deduped by name, case-insensitive)
- `tags` — new tags merged (deduped)
- **Edges** — creates new edges to existing persons if targets are found in graph
- **Events** — creates new events (birth, death, publications, awards, etc.)

**Response shape:**

```json
{
  "person": { ... },
  "enrichedFields": ["birthDate", "occupations", "tags"],
  "addedEdges": [],
  "addedEvents": [{ "type": "PUBLICATION", "title": "..." }],
  "enrichedPersonId": "person-id"
}
```

## Environment Setup

```bash
# In packages/backend/.env
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxx
```

Without this key, the backend returns a structured fallback message explaining the requirement.

## Source Files

| File | Description |
| ---- | ----------- |
| `backend/src/routes/research.ts` | Route handlers for research and enrich endpoints |
| `frontend/src/components/ResearchPanel.tsx` | React modal with dual tabs (New Person + Enrich Existing) |
| `frontend/src/components/RightPanel.tsx` | Person detail panel with ✨ Enrich Profile button |
| `frontend/src/api/client.ts` | `api.research()` and `api.enrichPerson()` methods |
| `frontend/src/App.tsx` | Research button in toolbar |

## Perplexity Prompt Design

The backend sends a structured prompt to the Perplexity Sonar model requesting JSON output with:

- **Person data**: canonical name, dates, bio summary, domain, occupations, affiliations, tags
- **Suggested edges**: named connections with relationship type and confidence
- **Timeline events**: dated milestones with event type classification
- **Citations**: source URLs from Perplexity's search results

This structured output is parsed and mapped to the Timeline Generator schema format.

### Existing Node Context

When calling the Perplexity API, the backend injects all existing person canonical names into the system prompt. This ensures that `suggestedEdges[].targetName` values precisely match nodes already in the graph, dramatically improving edge creation accuracy during both add-to-graph and enrichment flows.

### Data Normalization

All Perplexity responses pass through `normalizePersonData()` which ensures:

- `canonicalName` defaults to `'Unknown'`
- `occupations` handles both `string[]` and `{name, domain}[]` formats
- `confidence` is clamped to `[0, 1]` (defaults to `0.5`)
- `birthDate` / `deathDate` are preserved when present
- `tags`, `alternateNames`, `affiliations` default to `[]`

### Date Emphasis

The Perplexity prompt includes explicit instructions to always include `birthDate` and `deathDate`. Even approximate years (e.g. `"1950"`) are valuable for timeline placement.

### Frontend Error Handling

The `RightPanel` component is wrapped in a `RightPanelErrorBoundary` that catches render errors from incomplete person data. If a crash occurs, the boundary shows a recovery UI with a "Try again" button instead of a blank screen.

## Fallback Behavior

When `PERPLEXITY_API_KEY` is not set:

- Research endpoint returns a descriptive error with setup instructions
- Frontend displays the error in the results panel
- No crash or breaking behavior

## Screenshots

### New Person Tab

![Research modal - New Person tab](./assets/screenshot_research_new.png)

### Enrich Existing Tab

![Research modal - Enrich Existing tab](./assets/screenshot_research_enrich.png)
