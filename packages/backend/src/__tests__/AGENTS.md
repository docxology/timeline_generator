# AGENTS.md — backend/src/__tests__/

Tests use Vitest. Both files create a fresh `MemoryStore` instance (test-only in-memory IGraphStore) with seed data.
Route tests invoke store methods directly (logic-level), not HTTP requests.
The store test covers every public method; the route test covers every endpoint.
