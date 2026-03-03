# API Reference

Base URL: `http://localhost:3001`

All endpoints return JSON. Request bodies must be `Content-Type: application/json`.

---

## Health Check

### `GET /api/health`

Returns server status.

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "name": "Timeline Generator API",
  "engine": "neo4j",
  "timestamp": "2026-03-03T19:00:25.216Z"
}
```

---

## Persons

### `GET /api/persons`

List all persons with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | `string` | Full-text search across names, tags |
| `domain` | `string` | Filter by primary domain |
| `minYear` | `number` | Birth year minimum |
| `maxYear` | `number` | Birth year maximum |

**Response:**

```json
{
  "data": [
    {
      "id": "bucky-fuller",
      "canonicalName": "R. Buckminster Fuller",
      "birthDate": "1895-07-12",
      "deathDate": "1983-07-01",
      "primaryDomain": "architecture",
      "confidence": 0.97,
      "occupations": [...],
      "affiliations": [...]
    }
  ],
  "total": 20
}
```

### `GET /api/persons/:id`

Get a single person by ID.

**Response:** `Person` object or `404`.

### `POST /api/persons`

Create a new person.

**Request Body:** `CreatePerson` (Person without `id`)

**Response:** `201` with created `Person`.

### `PATCH /api/persons/:id`

Update an existing person.

**Request Body:** Partial `Person` fields.

**Response:** Updated `Person` or `404`.

### `DELETE /api/persons/:id`

Delete a person.

**Response:** `{ "success": true }` or `404`.

---

## Person Events

### `GET /api/persons/:id/events`

List temporal events for a person, sorted chronologically.

**Response:**

```json
{
  "data": [
    {
      "id": "ev-bucky-birth",
      "personId": "bucky-fuller",
      "type": "BIRTH",
      "title": "Born in Milton, Massachusetts",
      "date": "1895-07-12",
      "datePrecision": "day"
    }
  ],
  "total": 17
}
```

### `POST /api/persons/:id/events`

Add an event to a person.

**Request Body:** `CreateEvent` (Event without `id`, `personId` set from URL).

**Response:** `201` with created `TemporalEvent`.

---

## Person Network

### `GET /api/persons/:id/network`

Get the ego network around a person.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `depth` | `number` | `1` | BFS traversal depth |
| `edgeTypes` | `string` | all | Comma-separated edge type filter |

**Response:**

```json
{
  "center": { "id": "bucky-fuller", ... },
  "neighbors": [ { "id": "shoji-sadao", ... }, ... ],
  "edges": [ { "id": "edge-1", "sourceId": "bucky-fuller", ... }, ... ]
}
```

---

## Edges

### `GET /api/edges`

List all edges.

**Response:**

```json
{
  "data": [...],
  "total": 42
}
```

### `GET /api/edges/:id`

Get a single edge by ID.

### `POST /api/edges`

Create a new edge.

**Request Body:** `CreateEdge` (Edge without `id`).

### `PATCH /api/edges/:id`

Update an existing edge.

### `DELETE /api/edges/:id`

Delete an edge.

---

## Graph

### `GET /api/graph/full`

Get the full graph dataset for D3 visualization.

**Response:**

```json
{
  "nodes": [
    {
      "id": "bucky-fuller",
      "canonicalName": "R. Buckminster Fuller",
      "degree": 15,
      ...
    }
  ],
  "links": [
    {
      "id": "edge-bucky-shoji",
      "sourceId": "bucky-fuller",
      "targetId": "shoji-sadao",
      "edgeType": "COLLABORATED_WITH",
      ...
    }
  ]
}
```

### `GET /api/timeline`

Get timeline data for rendering lifespan bars.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `personIds` | `string` | Comma-separated person IDs (optional, defaults to all) |

**Response:**

```json
{
  "persons": [
    { "id": "bucky-fuller", "name": "R. Buckminster Fuller", "birthYear": 1895, "deathYear": 1983, "domain": "architecture", "events": [...] }
  ],
  "edges": [
    { "id": "...", "sourceId": "...", "targetId": "...", "type": "COLLABORATED_WITH", "startYear": 1954, "endYear": 1983, "confidence": 0.95 }
  ],
  "timeRange": { "min": 1879, "max": 2026 }
}
```

### `GET /api/paths`

Find the shortest path between two persons.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `from` | `string` | ✅ | Source person ID |
| `to` | `string` | ✅ | Target person ID |

**Response:**

```json
{
  "path": [ { "id": "bucky-fuller", ... }, { "id": "john-cage", ... } ],
  "edges": [ { "id": "...", "edgeType": "CONTEMPORANEOUS_AT", ... } ],
  "totalHops": 1
}
```

---

## Research (Perplexity AI)

### `POST /api/research`

Research a person using Perplexity Sonar API. Returns structured biographical data, suggested connections, and timeline events.

**Request Body:**

```json
{
  "query": "Nikola Tesla",
  "addToGraph": false
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | `string` | ✅ | Person name or search query |
| `addToGraph` | `boolean` | ❌ | If `true`, auto-creates person + edges + events in the graph |

**Response:**

```json
{
  "person": {
    "canonicalName": "Nikola Tesla",
    "birthDate": "1856-07-10",
    "deathDate": "1943-01-07",
    "bioSummary": "Serbian-American inventor...",
    "primaryDomain": "engineering",
    "occupations": [{"name": "Engineer"}, {"name": "Inventor"}],
    "tags": ["electricity", "AC power"]
  },
  "suggestedEdges": [
    {
      "targetName": "Thomas Edison",
      "edgeType": "OPPOSED",
      "confidence": 0.8,
      "description": "Rival in the War of Currents"
    }
  ],
  "suggestedEvents": [
    { "type": "BIRTH", "title": "Born in Smiljan", "date": "1856-07-10" }
  ],
  "summary": "Nikola Tesla was a Serbian-American inventor...",
  "citations": ["https://en.wikipedia.org/wiki/Nikola_Tesla"],
  "source": "perplexity"
}
```

**When `addToGraph: true`:**

- If person doesn't exist in graph, creates person + matched edges + events
- Response includes `addedToGraph: true` and `addedEdges: [...]`
- If person already exists, returns `existingPersonId`

**Requires:** `PERPLEXITY_API_KEY` environment variable. Without it, returns an error message.

### `POST /api/research/enrich/:id`

Enrich an existing person with additional Perplexity research.

**Response:**

```json
{
  "person": { ... },
  "enrichedFields": ["birthDate", "occupations", "tags"],
  "addedEdges": [
    {
      "id": "edge-1",
      "sourceId": "person-id",
      "targetId": "other-person-id",
      "edgeType": "COLLABORATED_WITH",
      "confidence": 0.5
    }
  ],
  "addedEvents": [
    { "type": "PUBLICATION", "title": "Published Example Paper", "date": "1960" }
  ],
  "enrichedPersonId": "person-id"
}
```

**Edge matching:** The backend injects all existing person canonical names into the Perplexity prompt, so suggested edges target exact matches. Edges are deduplicated — existing relationships are never recreated.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Person not found"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request (missing params) |
| `404` | Resource not found |
| `500` | Internal server error |
