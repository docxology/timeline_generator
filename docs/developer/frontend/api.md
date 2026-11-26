# frontend/src/api/

API client layer. All backend communication goes through `client.ts`.

## client.ts

16 typed methods wrapping `fetchJSON()`:

- Graph: `getFullGraph`, `getTimeline`, `findPath`
- Persons: `getPersons`, `getPerson`, `getPersonEvents`, `getPersonNetwork`, `createPerson`, `updatePerson`
- Edges: `getEdge`, `createEdge`, `updateEdge`
- Research: `research`, `enrichPerson`
