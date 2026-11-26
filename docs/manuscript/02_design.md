# Data model and interaction {#sec:design}

The shared TypeScript contracts distinguish `Person`, `Edge`, and
`TemporalEvent`. Person records can store birth and death dates, date
precision, occupations, affiliations, and provenance. An edge has source
and target identifiers, an edge type, direction, and confidence. Optional
start and end dates record its known bounds and optional evidence records
describe its sources. Events use a separate event type and date.

The browser initially requests `/api/graph/full`. The API returns the
people and edges plus a degree value for each person. The browser filters
edges by visible relationship category, confidence floor, and the selected
years. It excludes an edge when its known end precedes the selected
start, or when its known start follows the selected end. A missing bound
does not impose a limit on that side. All people remain in the graph, and
node radius reflects degree in the visible edge set.

The lifespan timeline derives its bars from person birth and death
fields. A person without a birth date has no bar. Selecting a person
opens the inspector, which fetches that person's dated events separately.
The browser updates its filters locally after the graph loads. Graph
layout position is a visual aid. The application derives connection
paths through the store interface, independently of the visual layout.
