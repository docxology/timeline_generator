/**
 * @module routes/graph
 * @description REST API routes for graph-level queries: timeline data,
 * shortest path, and full graph visualization payload.
 * All routes are prefixed with /api.
 */

import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';

/**
 * Register graph-level routes on the Fastify instance.
 * @param app - Fastify application instance.
 *
 * Routes:
 * - GET /api/timeline    — Timeline data for all or specific persons
 * - GET /api/paths       — Shortest path between two persons (BFS)
 * - GET /api/graph/full  — Full graph payload for D3 visualization
 */
export async function graphRoutes(app: FastifyInstance): Promise<void> {
    /**
     * GET /api/timeline
     * Get aggregated timeline data with lifespan ranges and events.
     * @query personIds - Comma-separated list of person IDs (optional, defaults to all).
     * @returns TimelineData
     */
    app.get('/api/timeline', async (request) => {
        const { personIds } = request.query as { personIds?: string };
        const ids = personIds ? personIds.split(',') : undefined;
        return await store.getTimelineData(ids);
    });

    /**
     * GET /api/paths
     * Find the shortest path between two persons via BFS.
     * @query from - Source person ID (required).
     * @query to - Target person ID (required).
     * @returns PathResult | 400 (missing params) | 404 (no path found)
     */
    app.get('/api/paths', async (request, reply) => {
        const { from, to } = request.query as { from?: string; to?: string };
        if (!from || !to) {
            return reply.status(400).send({ error: 'Both "from" and "to" query params required' });
        }
        const result = await store.findShortestPath(from, to);
        if (!result) {
            return reply.status(404).send({ error: 'No path found between these persons' });
        }
        return result;
    });

    /**
     * GET /api/graph/full
     * Fetch the complete graph for D3 force-directed visualization.
     * Returns all persons (with computed degree) as nodes and all edges as links.
     * @returns {nodes: GraphNode[], links: Edge[]}
     */
    app.get('/api/graph/full', async () => {
        const persons = await store.getAllPersons();
        const edges = await store.getAllEdges();
        const degrees = await store.getDegreesMap();
        return {
            nodes: persons.map(p => ({
                ...p,
                degree: degrees.get(p.id) || 0,
            })),
            links: edges,
        };
    });
}
