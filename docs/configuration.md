# Configuration

## Environment & Ports

| Service | Port | Description |
|---|---|---|
| Backend API | `3001` | Fastify REST server |
| Frontend Dev | `5173` | Vite development server |
| Neo4j Browser | `7474` | Neo4j web interface |
| Neo4j Bolt | `7687` | Neo4j Bolt protocol |

The frontend Vite config proxies `/api/*` requests to the backend.

## Environment Variables

**File:** `packages/backend/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend API port |
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j Bolt connection URI |
| `NEO4J_USER` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | `secretPassword` | Neo4j password |
| `PERPLEXITY_API_KEY` | — | Perplexity Sonar API key for research |

## Docker Compose

**File:** `docker-compose.yml`

```yaml
services:
  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/secretPassword
      NEO4J_PLUGINS: '["apoc"]'
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
```

## TypeScript

### Base Config (`tsconfig.base.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

Each package extends this with its own `tsconfig.json`.

### Package-Specific Configs

- **shared/tsconfig.json** — standard library compilation
- **seed-data/tsconfig.json** — standard library compilation
- **backend/tsconfig.json** — adds `outDir`, `rootDir`, `composite`
- **frontend/tsconfig.json** — adds `jsx: "react-jsx"`, React DOM types

## Vite Configuration

**File:** `packages/frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

## pnpm Workspace

**File:** `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
```

## Package Dependencies

### Root

```json
{
  "devDependencies": {
    "concurrently": "^9.2.1",
    "typescript": "^5.7.3"
  }
}
```

### Backend

- `fastify`, `@fastify/cors` — HTTP framework
- `neo4j-driver` — Neo4j Bolt protocol driver
- `dotenv` — environment variable loading
- `shared`, `seed-data` (workspace) — data and types
- `uuid` — ID generation
- `pino-pretty` — log formatting
- `tsx` (dev) — TypeScript execution
- `@types/node`, `@types/uuid` (dev) — type definitions
- `vitest` (dev) — test runner

### Shared

- `zod` — runtime schema validation

### Seed Data

- `shared` (workspace) — types and constants

### Frontend

- `react`, `react-dom` — UI framework
- `d3` — data visualization
- `zustand` — state management
- `shared` (workspace) — types and constants
- `vite`, `@vitejs/plugin-react` (dev) — build tooling
- `tailwindcss`, `autoprefixer`, `postcss` (dev) — styling
