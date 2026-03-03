# AGENTS.md — seed-data

Static dataset package. Depends on `shared` for types and enums.

## Conventions

- Person IDs are kebab-case slugs (e.g., `bucky-fuller`, `john-cage`)
- Dates use ISO 8601 format (`YYYY-MM-DD`)
- Confidence values reflect historical certainty: 0.95 for well-documented, 0.6 for inferred
- Every edge and event must reference a valid person ID

## File Map

```
src/
├── persons.ts          # 20 Person records
├── edges.ts            # 42 Edge records
├── events.ts           # 46 TemporalEvent records
├── index.ts            # Barrel export
└── __tests__/
    └── data-integrity.test.ts  # 28 referential integrity tests
```
