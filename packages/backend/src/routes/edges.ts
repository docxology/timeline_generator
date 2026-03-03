/**
 * @module routes/edges
 * @description REST API routes for relationship edge CRUD operations.
 * All routes are prefixed with /api/edges.
 */

import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';

/**
 * Register edge routes on the Fastify instance.
 * @param app - Fastify application instance.
 *
 * Routes:
 * - GET    /api/edges        — List all edges
 * - GET    /api/edges/:id    — Get a single edge by ID
 * - POST   /api/edges        — Create a new edge
 * - PATCH  /api/edges/:id    — Partially update an edge
 * - DELETE /api/edges/:id    — Delete an edge
 */
export async function edgeRoutes(app: FastifyInstance): Promise<void> {
    /**
     * GET /api/edges
     * List all relationship edges in the graph.
     * @returns {data: Edge[], total: number}
     */
    app.get('/api/edges', async () => {
        const edges = await store.getAllEdges();
        return { data: edges, total: edges.length };
    });

    /**
     * GET /api/edges/:id
     * Get a single edge by its unique ID.
     * @returns Edge | 404 error
     */
    app.get('/api/edges/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const edge = await store.getEdgeById(id);
        if (!edge) return reply.status(404).send({ error: 'Edge not found' });
        return edge;
    });

    /**
     * POST /api/edges
     * Create a new relationship edge with auto-generated ID.
     * @body CreateEdge data (sourceId, targetId, edgeType, direction, confidence required)
     * @returns Created Edge with 201 status
     */
    app.post('/api/edges', async (request, reply) => {
        const data = request.body as any;
        const edge = await store.createEdge(data);
        return reply.status(201).send(edge);
    });

    /**
     * PATCH /api/edges/:id
     * Partially update an existing edge.
     * @body Partial Edge data
     * @returns Updated Edge | 404 error
     */
    app.patch('/api/edges/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = request.body as any;
        const updated = await store.updateEdge(id, data);
        if (!updated) return reply.status(404).send({ error: 'Edge not found' });
        return updated;
    });

    /**
     * DELETE /api/edges/:id
     * Remove an edge from the graph.
     * @returns {success: true} | 404 error
     */
    app.delete('/api/edges/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const success = await store.deleteEdge(id);
        if (!success) return reply.status(404).send({ error: 'Edge not found' });
        return { success: true };
    });
}
