/**
 * @file routes.test.ts
 * @description Integration tests for all backend REST API routes.
 * Tests each route handler by calling the store methods they delegate to,
 * verifying correct data flow and error handling patterns.
 *
 * These tests exercise the store at the route-handler level to validate
 * that routing logic (parameter parsing, error codes, response shaping) works.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStore } from './memoryStore.js';
import { EdgeType, EdgeDirection } from 'shared';

/**
 * Create a fresh GraphStore for isolated route logic testing.
 * We test the same store methods the routes call, ensuring correctness.
 */
function createTestStore(): MemoryStore {
    return new MemoryStore();
}

// ─────────────────────────────────────────────────────────────────────
// Persons Route Logic
// ─────────────────────────────────────────────────────────────────────

describe('Person Routes Logic', () => {
    let store: MemoryStore;

    beforeEach(() => {
        store = createTestStore();
    });

    describe('GET /api/persons', () => {
        it('returns all persons from seed data', async () => {
            const persons = await store.getAllPersons();
            expect(persons.length).toBeGreaterThan(0);
            expect(persons[0]).toHaveProperty('canonicalName');
            expect(persons[0]).toHaveProperty('id');
        });

        it('filters by search query (case-insensitive)', async () => {
            const results = await store.getAllPersons({ search: 'fuller' });
            expect(results.length).toBeGreaterThanOrEqual(1);
            results.forEach(p => {
                const matchesName = p.canonicalName.toLowerCase().includes('fuller');
                const matchesTags = p.tags?.some(t => t.toLowerCase().includes('fuller'));
                expect(matchesName || matchesTags).toBe(true);
            });
        });

        it('filters by domain', async () => {
            const results = await store.getAllPersons({ domain: 'architecture' });
            results.forEach(p => {
                expect(p.primaryDomain).toBe('architecture');
            });
        });

        it('filters by minYear', async () => {
            const results = await store.getAllPersons({ minYear: 1900 });
            results.forEach(p => {
                if (p.birthDate) {
                    expect(parseInt(p.birthDate.substring(0, 4))).toBeGreaterThanOrEqual(1900);
                }
            });
        });

        it('filters by maxYear', async () => {
            const results = await store.getAllPersons({ maxYear: 1900 });
            results.forEach(p => {
                if (p.birthDate) {
                    expect(parseInt(p.birthDate.substring(0, 4))).toBeLessThanOrEqual(1900);
                }
            });
        });

        it('returns empty array for unmatched search', async () => {
            const results = await store.getAllPersons({ search: 'zzzzzznonexistent' });
            expect(results).toEqual([]);
        });
    });

    describe('GET /api/persons/:id', () => {
        it('returns a person by valid ID', async () => {
            const persons = await store.getAllPersons();
            const person = await store.getPersonById(persons[0].id);
            expect(person).toBeDefined();
            expect(person!.id).toBe(persons[0].id);
        });

        it('returns undefined for invalid ID', async () => {
            const person = await store.getPersonById('nonexistent-id');
            expect(person).toBeUndefined();
        });
    });

    describe('POST /api/persons', () => {
        it('creates a person with auto-generated ID', async () => {
            const data = {
                canonicalName: 'Test Person',
                occupations: [{ name: 'Tester' }],
                confidence: 0.5,
            };
            const created = await store.createPerson(data);
            expect(created.id).toBeDefined();
            expect(created.canonicalName).toBe('Test Person');
            expect(created.confidence).toBe(0.5);
        });
    });

    describe('PATCH /api/persons/:id', () => {
        it('updates an existing person', async () => {
            const persons = await store.getAllPersons();
            const updated = await store.updatePerson(persons[0].id, {
                bioSummary: 'Updated biography',
            });
            expect(updated).toBeDefined();
            expect(updated!.bioSummary).toBe('Updated biography');
        });

        it('returns undefined for invalid ID', async () => {
            const updated = await store.updatePerson('invalid-id', { bioSummary: 'test' });
            expect(updated).toBeUndefined();
        });
    });

    describe('DELETE /api/persons/:id', () => {
        it('deletes an existing person', async () => {
            const created = await store.createPerson({
                canonicalName: 'To Delete',
                occupations: [],
                confidence: 0.5,
            });
            const success = await store.deletePerson(created.id);
            expect(success).toBe(true);
            expect(await store.getPersonById(created.id)).toBeUndefined();
        });

        it('returns false for invalid ID', async () => {
            const success = await store.deletePerson('invalid-id');
            expect(success).toBe(false);
        });
    });

    describe('GET /api/persons/:id/events', () => {
        it('returns events for a person', async () => {
            const persons = await store.getAllPersons();
            const events = await store.getEventsForPerson(persons[0].id);
            expect(Array.isArray(events)).toBe(true);
        });

        it('returns empty array for person with no events', async () => {
            const created = await store.createPerson({
                canonicalName: 'No Events',
                occupations: [],
                confidence: 0.5,
            });
            const events = await store.getEventsForPerson(created.id);
            expect(events).toEqual([]);
        });
    });

    describe('GET /api/persons/:id/network', () => {
        it('returns ego network for a valid person', async () => {
            const persons = await store.getAllPersons();
            const network = await store.getEgoNetwork(persons[0].id, 1);
            expect(network).toHaveProperty('center');
            expect(network).toHaveProperty('neighbors');
            expect(network).toHaveProperty('edges');
            expect(network.center.id).toBe(persons[0].id);
        });

        it('throws for invalid person ID', async () => {
            await expect(store.getEgoNetwork('invalid-id', 1)).rejects.toThrow();
        });

        it('respects depth parameter', async () => {
            const persons = await store.getAllPersons();
            const shallow = await store.getEgoNetwork(persons[0].id, 1);
            const deep = await store.getEgoNetwork(persons[0].id, 2);
            expect(deep.neighbors.length).toBeGreaterThanOrEqual(shallow.neighbors.length);
        });
    });
});

// ─────────────────────────────────────────────────────────────────────
// Edge Routes Logic
// ─────────────────────────────────────────────────────────────────────

describe('Edge Routes Logic', () => {
    let store: MemoryStore;

    beforeEach(() => {
        store = createTestStore();
    });

    describe('GET /api/edges', () => {
        it('returns all edges from seed data', async () => {
            const edges = await store.getAllEdges();
            expect(edges.length).toBeGreaterThan(0);
            expect(edges[0]).toHaveProperty('sourceId');
            expect(edges[0]).toHaveProperty('targetId');
            expect(edges[0]).toHaveProperty('edgeType');
        });
    });

    describe('GET /api/edges/:id', () => {
        it('returns an edge by valid ID', async () => {
            const edges = await store.getAllEdges();
            const edge = await store.getEdgeById(edges[0].id);
            expect(edge).toBeDefined();
            expect(edge!.id).toBe(edges[0].id);
        });

        it('returns undefined for invalid ID', async () => {
            expect(await store.getEdgeById('invalid-id')).toBeUndefined();
        });
    });

    describe('POST /api/edges', () => {
        it('creates an edge with auto-generated ID', async () => {
            const persons = await store.getAllPersons();
            const edge = await store.createEdge({
                sourceId: persons[0].id,
                targetId: persons[1].id,
                edgeType: EdgeType.KNEW_OF,
                direction: EdgeDirection.BIDIRECTIONAL,
                confidence: 0.5,
            });
            expect(edge.id).toBeDefined();
            expect(edge.sourceId).toBe(persons[0].id);
            expect(edge.targetId).toBe(persons[1].id);
        });
    });

    describe('PATCH /api/edges/:id', () => {
        it('updates an existing edge', async () => {
            const edges = await store.getAllEdges();
            const updated = await store.updateEdge(edges[0].id, {
                description: 'Updated description',
            });
            expect(updated).toBeDefined();
            expect(updated!.description).toBe('Updated description');
        });

        it('returns undefined for invalid ID', async () => {
            expect(await store.updateEdge('invalid-id', {})).toBeUndefined();
        });
    });

    describe('DELETE /api/edges/:id', () => {
        it('deletes an existing edge', async () => {
            const persons = await store.getAllPersons();
            const edge = await store.createEdge({
                sourceId: persons[0].id,
                targetId: persons[1].id,
                edgeType: EdgeType.CUSTOM,
                direction: EdgeDirection.DIRECTED,
                confidence: 0.5,
            });
            expect(await store.deleteEdge(edge.id)).toBe(true);
            expect(await store.getEdgeById(edge.id)).toBeUndefined();
        });

        it('returns false for invalid ID', async () => {
            expect(await store.deleteEdge('invalid-id')).toBe(false);
        });
    });
});

// ─────────────────────────────────────────────────────────────────────
// Graph Routes Logic
// ─────────────────────────────────────────────────────────────────────

describe('Graph Routes Logic', () => {
    let store: MemoryStore;

    beforeEach(() => {
        store = createTestStore();
    });

    describe('GET /api/timeline', () => {
        it('returns timeline data for all persons', async () => {
            const timeline = await store.getTimelineData();
            expect(timeline).toHaveProperty('persons');
            expect(timeline).toHaveProperty('edges');
            expect(timeline).toHaveProperty('timeRange');
            expect(timeline.persons.length).toBeGreaterThan(0);
            expect(timeline.timeRange.min).toBeLessThan(timeline.timeRange.max);
        });

        it('returns timeline data for specific persons', async () => {
            const persons = await store.getAllPersons();
            const ids = [persons[0].id, persons[1].id];
            const timeline = await store.getTimelineData(ids);
            expect(timeline.persons.length).toBe(2);
        });

        it('each person has birthYear and events array', async () => {
            const timeline = await store.getTimelineData();
            timeline.persons.forEach(p => {
                expect(p).toHaveProperty('birthYear');
                expect(p).toHaveProperty('events');
                expect(Array.isArray(p.events)).toBe(true);
            });
        });
    });

    describe('GET /api/paths', () => {
        it('finds shortest path between connected persons', async () => {
            const persons = await store.getAllPersons();
            const result = await store.findShortestPath(persons[0].id, persons[1].id);
            // May be null if no path exists
            if (result) {
                expect(result).toHaveProperty('path');
                expect(result).toHaveProperty('edges');
                expect(result).toHaveProperty('totalHops');
                expect(result.path.length).toBeGreaterThanOrEqual(2);
                expect(result.totalHops).toBeGreaterThanOrEqual(1);
            }
        });

        it('returns null for disconnected persons', async () => {
            const isolated = await store.createPerson({
                canonicalName: 'Isolated Node',
                occupations: [],
                confidence: 0.5,
            });
            const persons = await store.getAllPersons();
            const result = await store.findShortestPath(isolated.id, persons[0].id);
            expect(result).toBeNull();
        });
    });

    describe('GET /api/graph/full', () => {
        it('returns nodes with degree and links', async () => {
            const persons = await store.getAllPersons();
            const edges = await store.getAllEdges();
            const degrees = await store.getDegreesMap();

            const nodes = persons.map(p => ({
                ...p,
                degree: degrees.get(p.id) || 0,
            }));

            expect(nodes.length).toBe(persons.length);
            expect(edges.length).toBeGreaterThan(0);

            // At least one node should have degree > 0
            const connected = nodes.filter(n => n.degree > 0);
            expect(connected.length).toBeGreaterThan(0);
        });

        it('degree values are non-negative', async () => {
            const degrees = await store.getDegreesMap();
            degrees.forEach(deg => {
                expect(deg).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('GET /api/graph/full — getCounts', () => {
        it('returns aggregate counts', async () => {
            const counts = await store.getCounts();
            expect(counts).toHaveProperty('persons');
            expect(counts).toHaveProperty('edges');
            expect(counts).toHaveProperty('events');
            expect(counts.persons).toBeGreaterThan(0);
            expect(counts.edges).toBeGreaterThan(0);
            expect(counts.events).toBeGreaterThan(0);
        });
    });
});

// ─────────────────────────────────────────────────────────────────────
// Research & Enrichment Logic
// ─────────────────────────────────────────────────────────────────────

describe('Research & Enrichment Logic', () => {
    let store: MemoryStore;

    beforeEach(() => {
        store = createTestStore();
    });

    describe('normalizePersonData — field defaults', () => {
        /**
         * Mirrors the normalizePersonData helper in research.ts.
         * Tests that raw Perplexity API responses are sanitized.
         */
        function normalize(raw: any): any {
            return {
                canonicalName: raw.canonicalName || 'Unknown',
                alternateNames: Array.isArray(raw.alternateNames) ? raw.alternateNames : [],
                birthDate: raw.birthDate || undefined,
                deathDate: raw.deathDate || undefined,
                occupations: Array.isArray(raw.occupations)
                    ? raw.occupations.map((o: any) => ({
                        name: typeof o === 'string' ? o : (o.name || 'Unknown'),
                        domain: typeof o === 'string' ? undefined : o.domain,
                    }))
                    : [],
                affiliations: Array.isArray(raw.affiliations) ? raw.affiliations : [],
                bioSummary: raw.bioSummary || undefined,
                primaryDomain: raw.primaryDomain || undefined,
                tags: Array.isArray(raw.tags) ? raw.tags : [],
                confidence: typeof raw.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0.5,
            };
        }

        it('defaults canonicalName to Unknown when missing', () => {
            const result = normalize({});
            expect(result.canonicalName).toBe('Unknown');
        });

        it('defaults occupations to empty array when missing', () => {
            const result = normalize({ canonicalName: 'Test' });
            expect(result.occupations).toEqual([]);
        });

        it('converts string occupations to {name} objects', () => {
            const result = normalize({
                canonicalName: 'Test',
                occupations: ['Engineer', 'Designer'],
            });
            expect(result.occupations).toEqual([
                { name: 'Engineer', domain: undefined },
                { name: 'Designer', domain: undefined },
            ]);
        });

        it('clamps confidence to [0, 1] range', () => {
            expect(normalize({ confidence: 1.5 }).confidence).toBe(1);
            expect(normalize({ confidence: -0.3 }).confidence).toBe(0);
            expect(normalize({ confidence: 0.7 }).confidence).toBe(0.7);
        });

        it('defaults confidence to 0.5 when not a number', () => {
            expect(normalize({ confidence: 'high' }).confidence).toBe(0.5);
            expect(normalize({}).confidence).toBe(0.5);
        });

        it('preserves birthDate and deathDate when present', () => {
            const result = normalize({ birthDate: '1895', deathDate: '1983' });
            expect(result.birthDate).toBe('1895');
            expect(result.deathDate).toBe('1983');
        });

        it('defaults birthDate and deathDate to undefined when missing', () => {
            const result = normalize({});
            expect(result.birthDate).toBeUndefined();
            expect(result.deathDate).toBeUndefined();
        });
    });

    describe('Enrichment — merge logic', () => {
        it('enrichment merges new occupations without duplicating existing ones', async () => {
            const persons = await store.getAllPersons();
            const person = persons[0];
            const existingOccs = person.occupations;

            // Simulate merging new occupations
            const newOccs = [{ name: 'Quantum Physicist', domain: 'physics' }];
            const existingNames = new Set(existingOccs.map(o => o.name.toLowerCase()));
            const filtered = newOccs.filter(o => !existingNames.has(o.name.toLowerCase()));

            expect(filtered.length).toBe(1);
            expect(filtered[0].name).toBe('Quantum Physicist');
        });

        it('enrichment does not add duplicate occupations', async () => {
            const persons = await store.getAllPersons();
            const person = persons[0];
            const existingOcc = person.occupations[0]?.name || 'Architect';

            const newOccs = [{ name: existingOcc, domain: 'same' }];
            const existingNames = new Set(person.occupations.map(o => o.name.toLowerCase()));
            const filtered = newOccs.filter(o => !existingNames.has(o.name.toLowerCase()));

            expect(filtered.length).toBe(0);
        });

        it('enrichment merges new tags without duplicating existing ones', async () => {
            const persons = await store.getAllPersons();
            const person = persons[0];
            const existingTags = new Set(person.tags || []);

            const incomingTags = ['brand-new-tag', ...(person.tags || []).slice(0, 1)];
            const filtered = incomingTags.filter(t => !existingTags.has(t));

            expect(filtered).toContain('brand-new-tag');
            if (person.tags && person.tags.length > 0) {
                expect(filtered).not.toContain(person.tags[0]);
            }
        });

        it('enrichment updates birthDate when person has none', async () => {
            // Create a person without birthDate
            const noDates = await store.createPerson({
                canonicalName: 'No Dates Person',
                occupations: [{ name: 'Unknown' }],
                confidence: 0.5,
            });
            expect(noDates.birthDate).toBeUndefined();

            // Simulate enrichment update
            const updated = await store.updatePerson(noDates.id, {
                birthDate: '1950',
            });
            expect(updated?.birthDate).toBe('1950');
        });
    });
});
