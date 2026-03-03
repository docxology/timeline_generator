# AGENTS.md — backend/src/routes/

Each route file follows this pattern:

1. Export a single async function that takes a Fastify instance
2. Register routes via `app.get()`, `app.post()`, etc.
3. Every handler has JSDoc with `@query`, `@body`, `@returns`
4. Errors return `{ error: string }` with appropriate HTTP status codes
5. The `store` singleton is imported from `../store.js`
