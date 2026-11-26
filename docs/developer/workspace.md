# Workspace source map

The pnpm workspace contains libraries, an API, and a browser application.
The root build compiles shared types and schemas first, then the seed-data
package, backend, and frontend.

| Package | Source and reference |
| --- | --- |
| `shared` | [Source](../../packages/shared/src/) · [package](shared.md) · [modules](shared/source.md) · [tests](shared/tests.md) |
| `seed-data` | [Source](../../packages/seed-data/src/) · [package](seed-data.md) · [modules](seed-data/source.md) · [tests](seed-data/tests.md) |
| `backend` | [Source](../../packages/backend/src/) · [package](backend.md) · [modules](backend/source.md) · [routes](backend/routes.md) · [tests](backend/tests.md) |
| `frontend` | [Source](../../packages/frontend/src/) · [package](frontend.md) · [modules](frontend/source.md) · [API client](frontend/api.md) · [components](frontend/components.md) · [graph](frontend/graph.md) · [store](frontend/store.md) · [timeline](frontend/timeline.md) |

Start with the [architecture](../architecture.md) for dependencies and runtime
data flow.
