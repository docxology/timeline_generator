import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { researchRoutes } from '../routes/research.js';
import { MemoryStore } from './memoryStore.js';
import { setGraphStore } from '../store.js';

describe('Research Routes (HTTP/Fastify Integration)', () => {
    let app: FastifyInstance;
    let store: MemoryStore;
    let fetchMock: any;

    beforeEach(async () => {
        // Setup in-memory store
        store = new MemoryStore();
        setGraphStore(store);

        // Setup Fastify and register the routes
        app = Fastify();
        await app.register(researchRoutes);
        await app.ready();

        // Mock fetch for Perplexity API
        fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (url, init) => {
            return {
                ok: true,
                json: async () => ({
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    person: {
                                        canonicalName: 'Mocked Person',
                                        alternateNames: ['Mocky'],
                                        birthDate: '1900',
                                        deathDate: '2000',
                                        occupations: [{ name: 'Scientist', domain: 'science' }],
                                        confidence: 0.9,
                                        bioSummary: 'A mocked scientist.',
                                        primaryDomain: 'science',
                                        tags: ['physics']
                                    },
                                    suggestedEdges: [
                                        {
                                            targetName: 'Existing Person',
                                            edgeType: 'COLLABORATED_WITH',
                                            confidence: 0.8,
                                            description: 'Worked together'
                                        }
                                    ],
                                    suggestedEvents: [
                                        {
                                            type: 'PUBLICATION',
                                            title: 'Mocked Paper',
                                            date: '1930'
                                        }
                                    ],
                                    summary: 'Test summary'
                                })
                            }
                        }
                    ],
                    citations: ['https://example.com/mock']
                })
            } as unknown as Response;
        });

        // Set fake API key so that the API call is triggered rather than fallback
        process.env.PERPLEXITY_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete process.env.PERPLEXITY_API_KEY;
    });

    describe('POST /api/research', () => {
        it('returns 400 if query is missing', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/research',
                payload: {}
            });
            expect(response.statusCode).toBe(400);
            expect(response.json()).toEqual({ error: 'Query is required' });
        });

        it('returns research data without adding to graph if addToGraph is false', async () => {
            const initialPersons = await store.getAllPersons();

            const response = await app.inject({
                method: 'POST',
                url: '/api/research',
                payload: { query: 'Mocked Person', addToGraph: false }
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();

            expect(data.person.canonicalName).toBe('Mocked Person');
            expect(data.source).toBe('perplexity');
            expect(data.citations).toContain('https://example.com/mock');

            // Should not be added to store
            const finalPersons = await store.getAllPersons();
            expect(finalPersons.length).toBe(initialPersons.length);
        });

        it('adds person, events, and edges to graph when addToGraph is true', async () => {
            // Pre-seed 'Existing Person' to test edge creation
            const target = await store.createPerson({
                canonicalName: 'Existing Person',
                occupations: [],
                confidence: 1.0
            });

            const initialPersons = await store.getAllPersons();
            const initialEdges = await store.getAllEdges();

            const response = await app.inject({
                method: 'POST',
                url: '/api/research',
                payload: { query: 'Mocked Person', addToGraph: true }
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();
            expect(data.addedToGraph).toBe(true);

            // Verify store updates
            const persons = await store.getAllPersons();
            expect(persons.length).toBe(initialPersons.length + 1); // 'Mocked Person' appended

            const mockedPerson = persons.find(p => p.canonicalName === 'Mocked Person');
            expect(mockedPerson).toBeDefined();
            expect(mockedPerson?.birthDate).toBe('1900');

            const edges = await store.getAllEdges();
            expect(edges.length).toBe(initialEdges.length + 1);
            const newEdge = edges.find(e => e.sourceId === mockedPerson?.id);
            expect(newEdge).toBeDefined();
            expect(newEdge?.targetId).toBe(target.id);
            expect(newEdge?.edgeType).toBe('COLLABORATED_WITH');

            const events = await store.getEventsForPerson(mockedPerson!.id);
            expect(events.length).toBe(1);
            expect(events[0].title).toBe('Mocked Paper');
        });

        it('returns existingPersonId if person already exists', async () => {
            const existing = await store.createPerson({
                canonicalName: 'Mocked Person',
                occupations: [],
                confidence: 1.0
            });

            const response = await app.inject({
                method: 'POST',
                url: '/api/research',
                payload: { query: 'Mocked Person', addToGraph: true }
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();
            expect(data.addedToGraph).toBe(false);
            expect(data.existingPersonId).toBe(existing.id);
        });

        it('handles missing API key explicitly by returning fallback', async () => {
            delete process.env.PERPLEXITY_API_KEY;

            const response = await app.inject({
                method: 'POST',
                url: '/api/research',
                payload: { query: 'Mocked Person', addToGraph: false }
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();
            expect(data.person).toBeNull();
            expect(data.error).toBeDefined();
        });
    });

    describe('POST /api/research/enrich/:id', () => {
        it('returns 404 for unknown person ID', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/research/enrich/unknown-id'
            });

            expect(response.statusCode).toBe(404);
            expect(response.json()).toEqual({ error: 'Person not found' });
        });

        it('enriches existing person with new data, edges, and events', async () => {
            // Person exists but is missing birthDate, bioSummary, and tags
            const existing = await store.createPerson({
                canonicalName: 'Mocked Person', // Name must match perplexity mock to be logically consistent
                occupations: [{ name: 'Teacher', domain: 'education' }],
                confidence: 0.5,
                tags: ['original-tag']
            });

            // Target person for the suggested edge
            const target = await store.createPerson({
                canonicalName: 'Existing Person',
                occupations: [],
                confidence: 1.0
            });

            const initialEdges = await store.getAllEdges();

            const response = await app.inject({
                method: 'POST',
                url: `/api/research/enrich/${existing.id}`
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();

            // Verify response shape
            expect(data.enrichedPersonId).toBe(existing.id);
            expect(data.enrichedFields).toContain('birthDate');
            expect(data.enrichedFields).toContain('bioSummary');
            expect(data.enrichedFields).toContain('primaryDomain');
            expect(data.enrichedFields).toContain('occupations');
            expect(data.enrichedFields).toContain('tags');
            expect(data.addedEdges.length).toBe(1);
            expect(data.addedEvents.length).toBe(1);

            // Verify store updates
            const updated = await store.getPersonById(existing.id);
            expect(updated?.birthDate).toBe('1900'); // updated
            expect(updated?.deathDate).toBe('2000'); // updated
            expect(updated?.bioSummary).toBe('A mocked scientist.'); // updated
            expect(updated?.tags).toEqual(['original-tag', 'physics']); // merged

            // Occupations should be merged
            const occNames = updated?.occupations.map(o => o.name);
            expect(occNames).toContain('Teacher');
            expect(occNames).toContain('Scientist');

            // Edges and events
            const edges = await store.getAllEdges();
            expect(edges.length).toBe(initialEdges.length + 1);
            const newEdge = edges.find(e => e.sourceId === existing.id && e.targetId === target.id);
            expect(newEdge).toBeDefined();

            const events = await store.getEventsForPerson(existing.id);
            expect(events.length).toBeGreaterThan(0);
            const newEvent = events.find(e => e.title === 'Mocked Paper');
            expect(newEvent).toBeDefined();
        });

        it('handles Perplexity API failure gracefully', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network Error'));

            const existing = await store.createPerson({
                canonicalName: 'Mocked Person',
                occupations: [],
                confidence: 1.0
            });

            const response = await app.inject({
                method: 'POST',
                url: `/api/research/enrich/${existing.id}`
            });

            // Fastify error handler catches this and returns 500
            expect(response.statusCode).toBe(500);
            expect(response.json().error).toContain('Network Error');
        });
    });
});
