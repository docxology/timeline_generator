# seed-data/src/__tests__/

23 referential integrity tests in `data-integrity.test.ts`.

Validates:

- Every edge `sourceId` and `targetId` exists in the persons array
- Every event `personId` exists in the persons array
- All required fields are present and well-typed
- Confidence values are in [0, 1]
- No duplicate IDs
