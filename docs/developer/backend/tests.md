# Backend tests

| Source | Scope |
| --- | --- |
| [Store cases](../../../packages/backend/src/__tests__/store.test.ts) | In-memory CRUD, filters, events, graph queries |
| [Route logic cases](../../../packages/backend/src/__tests__/routes.test.ts) | Store operations delegated to by the HTTP layer and normalization cases |
| [Research route cases](../../../packages/backend/src/__tests__/research-routes.test.ts) | Fastify injection using stubbed upstream responses |

See [testing](../../testing.md) for the workspace commands and coverage scope.
