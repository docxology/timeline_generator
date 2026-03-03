# AGENTS.md — frontend/src/api/

All API calls use the `fetchJSON<T>()` generic wrapper. It:

- Prepends `/api` base URL
- Sets `Content-Type: application/json`
- Throws Error with server message on non-OK responses
- Returns parsed JSON typed as `T`

Never use raw `fetch()` in components — always go through `api.methodName()`.
