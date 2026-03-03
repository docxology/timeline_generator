# Seed Data Reference

The seed dataset encodes the first-degree intellectual network around **R. Buckminster Fuller**.

## Dataset Statistics

| Entity | Count |
|---|---|
| Persons | 20 |
| Relationship Edges | 42+ |
| Temporal Events | 46+ |
| Edge Types Used | 16 of 26 |
| Date Range | 1879–2026 |

## Persons

| ID | Name | Birth | Death | Domain | Confidence |
|---|---|---|---|---|---|
| `bucky-fuller` | R. Buckminster Fuller | 1895 | 1983 | architecture | 0.97 |
| `anne-hewlett-fuller` | Anne Hewlett Fuller | 1896 | 1983 | family | 0.90 |
| `shoji-sadao` | Shoji Sadao | 1927 | 2019 | architecture | 0.90 |
| `john-cage` | John Cage | 1912 | 1992 | music | 0.95 |
| `merce-cunningham` | Merce Cunningham | 1919 | 2009 | dance | 0.92 |
| `kenneth-snelson` | Kenneth Snelson | 1927 | 2016 | art | 0.90 |
| `isamu-noguchi` | Isamu Noguchi | 1904 | 1988 | art | 0.92 |
| `marshall-mcluhan` | Marshall McLuhan | 1911 | 1980 | philosophy | 0.92 |
| `stewart-brand` | Stewart Brand | 1938 | — | counterculture | 0.93 |
| `norbert-wiener` | Norbert Wiener | 1894 | 1964 | cybernetics | 0.95 |
| `albert-einstein` | Albert Einstein | 1879 | 1955 | science | 0.80 |
| `josef-albers` | Josef Albers | 1888 | 1976 | art | 0.90 |
| `walter-gropius` | Walter Gropius | 1883 | 1969 | architecture | 0.85 |
| `ej-applewhite` | E. J. Applewhite | 1919 | 2005 | writing | 0.88 |
| `amy-edmondson` | Amy Edmondson | 1959 | — | education | 0.85 |
| `medard-gabel` | Medard Gabel | 1943 | — | futurism | 0.82 |
| `barbara-ward` | Barbara Ward | 1914 | 1981 | journalism | 0.78 |
| `paul-ehrlich` | Paul Ehrlich | 1932 | — | ecology | 0.75 |
| `allegra-fuller-snyder` | Allegra Fuller Snyder | 1927 | 1999 | dance | 0.85 |
| `jaime-snyder` | Jaime Snyder | 1959 | — | design | 0.80 |

## Relationship Types Used

| Edge Type | Count | Category |
|---|---|---|
| `COLLABORATED_WITH` | 9 | Collaboration |
| `KNEW_OF` | 9 | Epistemic |
| `MENTORED` / `MENTORED_BY` | 5 | Pedagogical |
| `CORRESPONDED_WITH` | 5 | Correspondence |
| `INFLUENCED_BY` | 4 | Influence |
| `CONTEMPORANEOUS_AT` | 4 | Spatial |
| `SPOUSE_OF` | 1 | Family |
| `PARENT_OF` / `CHILD_OF` | 3 | Family |
| `INSPIRED_WORK` | 1 | Influence |
| `STUDENT_OF` | 1 | Pedagogical |

## Data Sources

The seed data is encoded from publicly available historical records:

- Wikipedia articles
- Patent records (US Patent No. 2,682,235)
- Published correspondence
- Institutional archives (Black Mountain College, SIU, Harvard)
- Published biographies and autobiographies

All relationships carry a `confidence` score reflecting source reliability. See [Data Model → Confidence Tiers](./data-model.md#confidence-tiers).

## Adding New Seed Data

To add a person to the seed network:

1. Add a `Person` object to `packages/seed-data/src/persons.ts`
2. Add relationship `Edge` objects to `packages/seed-data/src/edges.ts`
3. Add `TemporalEvent` objects to `packages/seed-data/src/events.ts`
4. All three files export arrays that `hydrate.ts` inserts into Neo4j on first boot
5. Restart the backend to pick up changes (or clear Neo4j data to re-trigger hydration)

```typescript
// packages/seed-data/src/persons.ts
{
  id: 'new-person-id',
  canonicalName: 'Jane Doe',
  birthDate: '1940-05-15',
  birthDatePrecision: DatePrecision.DAY,
  deathDate: '2020-12-01',
  occupations: [{ name: 'Engineer', domain: 'engineering' }],
  primaryDomain: 'engineering',
  confidence: 0.85,
}
```
