/**
 * @module routes/persons
 * @description REST API routes for person CRUD, events, and ego network queries.
 * All routes are prefixed with /api/persons.
 */

import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';

/**
 * Register person routes on the Fastify instance.
 * @param app - Fastify application instance.
 *
 * Routes:
 * - GET    /api/persons           — List all persons with optional search/domain/year filters
 * - GET    /api/persons/:id       — Get a single person by ID
 * - POST   /api/persons           — Create a new person
 * - PATCH  /api/persons/:id       — Partially update a person
 * - DELETE /api/persons/:id       — Delete a person
 * - GET    /api/persons/:id/events   — Get temporal events for a person
 * - POST   /api/persons/:id/events   — Create a new event for a person
 * - GET    /api/persons/:id/network  — Get ego network (BFS)
 */
export async function personRoutes(app: FastifyInstance): Promise<void> {
    /**
     * GET /api/persons
     * List all persons with optional filters.
     * @query search - Text search across name, tags, and domain.
     * @query domain - Filter by primary domain.
     * @query minYear - Filter by minimum birth year.
     * @query maxYear - Filter by maximum birth year.
     * @returns {data: Person[], total: number}
     */
    app.get('/api/persons', async (request) => {
        const { search, domain, minYear, maxYear } = request.query as {
            search?: string; domain?: string; minYear?: string; maxYear?: string;
        };
        const persons = await store.getAllPersons({
            search,
            domain,
            minYear: minYear ? parseInt(minYear) : undefined,
            maxYear: maxYear ? parseInt(maxYear) : undefined,
        });
        return { data: persons, total: persons.length };
    });

    /**
     * GET /api/persons/:id
     * Get a single person by their unique ID.
     * @returns Person | 404 error
     */
    app.get('/api/persons/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const person = await store.getPersonById(id);
        if (!person) return reply.status(404).send({ error: 'Person not found' });
        return person;
    });

    /**
     * POST /api/persons
     * Create a new person entry with auto-generated ID.
     * @body CreatePerson data (canonicalName, occupations, confidence required)
     * @returns Created Person with 201 status
     */
    app.post('/api/persons', async (request, reply) => {
        const data = request.body as any;
        const person = await store.createPerson(data);
        return reply.status(201).send(person);
    });

    /**
     * PATCH /api/persons/:id
     * Partially update an existing person.
     * @body Partial Person data
     * @returns Updated Person | 404 error
     */
    app.patch('/api/persons/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = request.body as any;
        const updated = await store.updatePerson(id, data);
        if (!updated) return reply.status(404).send({ error: 'Person not found' });
        return updated;
    });

    /**
     * DELETE /api/persons/:id
     * Remove a person from the graph.
     * @returns {success: true} | 404 error
     */
    app.delete('/api/persons/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const success = await store.deletePerson(id);
        if (!success) return reply.status(404).send({ error: 'Person not found' });
        return { success: true };
    });

    /**
     * GET /api/persons/:id/events
     * List all temporal events for a specific person.
     * @returns {data: TemporalEvent[], total: number} | 404 error
     */
    app.get('/api/persons/:id/events', async (request, reply) => {
        const { id } = request.params as { id: string };
        const person = await store.getPersonById(id);
        if (!person) return reply.status(404).send({ error: 'Person not found' });
        const events = await store.getEventsForPerson(id);
        return { data: events, total: events.length };
    });

    /**
     * POST /api/persons/:id/events
     * Create a new temporal event for an existing person.
     * @body CreateEvent data (type, title, date required)
     * @returns Created TemporalEvent with 201 status
     */
    app.post('/api/persons/:id/events', async (request, reply) => {
        const { id } = request.params as { id: string };
        const person = await store.getPersonById(id);
        if (!person) return reply.status(404).send({ error: 'Person not found' });
        const data = request.body as any;
        const event = await store.createEvent({ ...data, personId: id });
        return reply.status(201).send(event);
    });

    /**
     * GET /api/persons/:id/network
     * Compute the ego network around a person using BFS traversal.
     * @query depth - BFS traversal depth (default: 1).
     * @query edgeTypes - Comma-separated list of EdgeTypes to follow.
     * @returns NetworkResponse | 404 error
     */
    app.get('/api/persons/:id/network', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { depth, edgeTypes } = request.query as { depth?: string; edgeTypes?: string };
        try {
            const network = await store.getEgoNetwork(
                id,
                depth ? parseInt(depth) : 1,
                edgeTypes ? edgeTypes.split(',') as any : undefined,
            );
            return network;
        } catch (e: any) {
            return reply.status(404).send({ error: e.message });
        }
    });
}
