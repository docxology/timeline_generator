# Data Model

The Timeline Generator data model treats **people as nodes** and **relationships as typed edges** in a temporal knowledge graph. All entities carry confidence scores and provenance metadata.

## Core Entities

### Person (`Person`)

The fundamental node type. Every person in the graph is a first-class temporal object.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier (UUID) |
| `canonicalName` | `string` | ✅ | Primary display name |
| `alternateNames` | `string[]` | | Nicknames, aliases, pen names |
| `birthDate` | `string` | | ISO 8601 date or year |
| `birthDatePrecision` | `DatePrecision` | | `day`, `month`, `year`, `approximate` |
| `birthPlace` | `Place` | | Geographic birth location |
| `deathDate` | `string` | | ISO 8601 date or year |
| `deathDatePrecision` | `DatePrecision` | | Precision qualifier |
| `deathPlace` | `Place` | | Geographic death location |
| `gender` | `string` | | Free-text gender identity |
| `nationalities` | `Nationality[]` | | With optional temporal bounds |
| `occupations` | `Occupation[]` | ✅ | With domain classification |
| `affiliations` | `Affiliation[]` | | Institutions, roles, date ranges |
| `bioSummary` | `string` | | Short biographical abstract |
| `bioLong` | `string` | | Extended biography |
| `imageUrl` | `string` | | Portrait URL |
| `wikidataId` | `string` | | Wikidata Q-identifier |
| `wikipediaSlug` | `string` | | Wikipedia article slug |
| `confidence` | `number` | ✅ | 0.0–1.0 record confidence score |
| `provenance` | `Source[]` | | Citation chain |
| `tags` | `string[]` | | Free-form tags for search |
| `primaryDomain` | `string` | | Primary intellectual domain |
| `customFields` | `Record<string, unknown>` | | Extensible metadata |

### Edge (`Edge`)

A typed, dated, weighted relationship between two persons.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier |
| `sourceId` | `string` | ✅ | Source person ID |
| `targetId` | `string` | ✅ | Target person ID |
| `edgeType` | `EdgeType` | ✅ | Relationship type (26 types) |
| `customLabel` | `string` | | Free-text label for CUSTOM edges |
| `direction` | `EdgeDirection` | ✅ | `DIRECTED` or `BIDIRECTIONAL` |
| `startDate` | `string` | | When the relationship began |
| `endDate` | `string` | | When the relationship ended |
| `strength` | `number` | | 0.0–1.0 relationship intensity |
| `confidence` | `number` | ✅ | 0.0–1.0 epistemic confidence |
| `description` | `string` | | Human-readable edge narrative |
| `evidence` | `Source[]` | | Supporting citations |
| `tags` | `string[]` | | Free-form tags |
| `colorOverride` | `string` | | Custom hex color |
| `weightOverride` | `number` | | Custom rendering weight |

### Temporal Event (`TemporalEvent`)

A dated occurrence in a person's life — births, publications, awards, positions, etc.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier |
| `personId` | `string` | ✅ | Associated person |
| `type` | `EventType` | ✅ | Event category |
| `title` | `string` | ✅ | Event display name |
| `description` | `string` | | Detailed description |
| `date` | `string` | ✅ | ISO 8601 date or year |
| `datePrecision` | `DatePrecision` | | Precision qualifier |
| `endDate` | `string` | | For events with duration |
| `place` | `Place` | | Geographic location |
| `confidence` | `number` | | 0.0–1.0 confidence |
| `provenance` | `Source[]` | | Supporting citations |
| `tags` | `string[]` | | Free-form tags |

## Edge Type Taxonomy

26 typed edge types organized into 10 categories:

### Epistemic

| Type | Description | Direction |
|---|---|---|
| `KNEW_OF` | Awareness without meeting | Directed |
| `READ_WORK_OF` | Read another's publications | Directed |
| `CITED` | Formal citation in a publication | Directed |

### Influence

| Type | Description | Direction |
|---|---|---|
| `INFLUENCED_BY` | Intellectual influence | Directed |
| `INSPIRED_WORK` | Inspired specific creative work | Directed |

### Correspondence

| Type | Description | Direction |
|---|---|---|
| `CORRESPONDED_WITH` | Letter/email exchange | Bidirectional |

### Collaboration

| Type | Description | Direction |
|---|---|---|
| `MET_IN_PERSON` | Physical meeting | Bidirectional |
| `COLLABORATED_WITH` | Joint project | Bidirectional |

### Pedagogical

| Type | Description | Direction |
|---|---|---|
| `MENTORED` | Mentor → mentee | Directed |
| `MENTORED_BY` | Mentee → mentor | Directed |
| `TAUGHT` | Teacher → student | Directed |
| `STUDENT_OF` | Student → teacher | Directed |

### Family / Genealogical

| Type | Description | Direction |
|---|---|---|
| `PARENT_OF` | Parent → child | Directed |
| `CHILD_OF` | Child → parent | Directed |
| `SIBLING_OF` | Sibling relationship | Bidirectional |
| `SPOUSE_OF` | Marriage/partnership | Bidirectional |
| `RELATIVE_OF` | Extended family | Bidirectional |

### Institutional

| Type | Description | Direction |
|---|---|---|
| `PATRON_OF` | Financial patron | Directed |
| `FUNDED_BY` | Received patronage | Directed |
| `EMPLOYED_BY` | Employment relationship | Directed |
| `EMPLOYER_OF` | Employer → employee | Directed |

### Spatial / Contemporaneous

| Type | Description | Direction |
|---|---|---|
| `CONTEMPORANEOUS_AT` | Overlapping presence at a location/institution | Bidirectional |

### Conflict

| Type | Description | Direction |
|---|---|---|
| `OPPOSED` | Intellectual or personal opposition | Directed |

### Custom

| Type | Description | Direction |
|---|---|---|
| `CUSTOM` | User-defined relationship | Either |

## Event Types

12 event categories for temporal encoding:

| Type | Description | Example |
|---|---|---|
| `BIRTH` | Birth event | Born in Milton, MA |
| `DEATH` | Death event | Died in Los Angeles |
| `EDUCATION` | Schooling, degrees | Entered Harvard |
| `PUBLICATION` | Books, papers, patents | Published "Synergetics" |
| `INVENTION` | Created an artifact | Geodesic Dome patent |
| `AWARD` | Honors, medals, prizes | Presidential Medal of Freedom |
| `POSITION` | Job, professorship | Norton Professor at Harvard |
| `RESIDENCE` | Where they lived | Moved to Carbondale, IL |
| `TRAVEL` | Significant travel | Lecture tour |
| `COLLABORATION` | Joint project event | World Game project |
| `MILESTONE` | Notable life event | Founded Long Now Foundation |
| `CUSTOM` | User-defined event | Any |

## Confidence Tiers

Epistemic provenance is encoded as a 0.0–1.0 confidence score with named tiers:

| Range | Label | Description |
|---|---|---|
| 0.9–1.0 | **Attested** | Primary source documentation |
| 0.7–0.9 | **High** | Multiple secondary sources in agreement |
| 0.5–0.7 | **Moderate** | Single secondary source; Wikipedia with citation |
| 0.3–0.5 | **Low** | LLM inference; co-mention without documented interaction |
| 0.0–0.3 | **Speculative** | User hypothesis; no documentary evidence |

## Validation

All entities have corresponding **Zod schemas** in `packages/shared/src/schemas.ts`:

- `PersonSchema` — validates full person records
- `EdgeSchema` — validates relationship edges
- `TemporalEventSchema` — validates events
- `FocalGraphSchema` — validates saved graph views
- `CreatePersonSchema` — person creation (omits `id`)
- `UpdatePersonSchema` — partial person update
- `CreateEdgeSchema` — edge creation
- `CreateEventSchema` — event creation

```typescript
import { PersonSchema, CreateEdgeSchema } from 'shared';

// Validate incoming data
const result = PersonSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
}
```

## Domain Color Map

19 domain colors for node visualization:

| Domain | Color | Hex |
|---|---|---|
| Architecture | Red | `#EF4444` |
| Systems Theory | Red Dark | `#DC2626` |
| Art | Red Light | `#f87171` |
| Music | Red Deep | `#B91C1C` |
| Dance | Red Pale | `#fca5a5` |
| Science | Gray Light | `#d4d4d4` |
| Mathematics | Gray Core | `#a3a3a3` |
| Philosophy | Gray Bright | `#e5e5e5` |
| Ecology | Gray Dark | `#737373` |
| Design | White | `#f5f5f5` |
| Engineering | Red Deepest | `#991B1B` |
| Education | Gray Core | `#a3a3a3` |
| Writing | Gray Very Dark | `#525252` |
| Journalism | Gray Light | `#d4d4d4` |
| Family | Red Pale | `#fecaca` |
| Policy | Gray Dark | `#737373` |
| Futurism | Red | `#EF4444` |
| Cybernetics | Gray Bright | `#e5e5e5` |
| Counterculture | Red Dark | `#DC2626` |
| Default | Gray Core | `#a3a3a3` |
