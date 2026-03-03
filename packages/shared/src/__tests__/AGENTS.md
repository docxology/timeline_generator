# AGENTS.md — shared/src/__tests__/

Tests use Vitest. Import from `../` (not from `shared`) to test the source directly.
The exports test verifies that every symbol from types, schemas, and constants is re-exported from index.ts.
