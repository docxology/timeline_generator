# AGENTS.md — seed-data/src/

Exports three arrays: `PERSONS`, `EDGES`, `EVENTS`. All records use types from `shared`.
Person IDs are kebab-case (e.g., `bucky-fuller`). Dates are ISO 8601.
Every edge and event must reference a valid person ID — integrity enforced by tests.
