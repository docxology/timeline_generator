# Getting started

Use the [Node version recorded in the workspace](../.node-version) and
pnpm 11. Docker with the Compose plugin is required for the standard
Neo4j-backed development server. The native build and tests run without
Docker.

## Install and verify

```sh
git clone https://github.com/docxology/timeline_generator.git
cd timeline_generator
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

The test suite uses checked-in seed and in-memory test fixtures. See
[what the tests cover](testing.md) for the boundaries of the local checks.

## Start the local application

```sh
docker compose up -d
docker compose ps
pnpm dev
```

Wait for Neo4j to report healthy before starting the backend. On first boot
the backend applies uniqueness constraints and inserts the seed data when
there are no Person nodes. The browser interface is on port 5173 and the
API is on port 3001. Vite proxies `/api` to the backend. Run
`pnpm dev:backend` and `pnpm dev:frontend` in separate terminals if you need
separate logs. See [configuration](configuration.md) for port, environment,
and storage details.

The alternative [run script](../run.sh) installs dependencies, starts
Compose, type-checks the backend, runs tests, and launches the dev servers.
Its launch step stops prior processes on the default app ports. Use the
separate startup commands if those ports serve other applications.
The `--test-only` flag skips only the final launch and still runs the Docker
and installation stages. For a database-free check, use `pnpm test`.

## Explore the graph

1. Pan and zoom the graph, then select a person or an edge to open its inspector.
2. Search the left-hand directory by name, tags, or domain.
3. Use the layer buttons and confidence slider to change the visible relationships.
4. Drag across the timeline to keep relationships whose years overlap the brushed
   range. People remain visible even if their relationships are filtered out.
5. Clear the time filter to restore relationships allowed by the active layers
   and confidence threshold.

The [interface gallery](gallery.md) illustrates these controls. Optional
[research and enrichment](research.md) require a separately configured provider.
