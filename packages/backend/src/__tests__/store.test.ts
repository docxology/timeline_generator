import { describe, it, expect, beforeAll } from 'vitest';
import { MemoryStore } from './memoryStore.js';
import type { Person, Edge, TemporalEvent } from 'shared';
import { EdgeType, EdgeDirection, EventType } from 'shared';

let store: MemoryStore;

beforeAll(() => {
    store = new MemoryStore();
});

// ── Seed Data Loading ───────────────────────────────────────────────

describe('Seed Data Loading', () => {
    it('loads persons from seed data', async () => {
        const counts = await store.getCounts();
        expect(counts.persons).toBeGreaterThanOrEqual(20);
    });

    it('loads edges from seed data', async () => {
        const counts = await store.getCounts();
        expect(counts.edges).toBeGreaterThanOrEqual(40);
    });

    it('loads events from seed data', async () => {
        const counts = await store.getCounts();
        expect(counts.events).toBeGreaterThanOrEqual(40);
    });

    it('getCounts returns all three counts', async () => {
        const counts = await store.getCounts();
        expect(counts).toHaveProperty('persons');
        expect(counts).toHaveProperty('edges');
        expect(counts).toHaveProperty('events');
    });
});

// ── Person CRUD ─────────────────────────────────────────────────────

describe('Person CRUD', () => {
    it('getAllPersons returns all seed persons', async () => {
        const persons = await store.getAllPersons();
        expect(persons.length).toBeGreaterThanOrEqual(20);
    });

    it('getPersonById returns Fuller', async () => {
        const bucky = await store.getPersonById('bucky-fuller');
        expect(bucky).toBeDefined();
        expect(bucky!.canonicalName).toContain('Fuller');
    });

    it('getPersonById returns undefined for unknown ID', async () => {
        expect(await store.getPersonById('nonexistent')).toBeUndefined();
    });

    it('createPerson creates and returns a new person', async () => {
        const data = {
            canonicalName: 'Test Person',
            occupations: [{ name: 'Tester' }],
            confidence: 0.5,
        } as Omit<Person, 'id'>;

        const created = await store.createPerson(data);
        expect(created.id).toBeTruthy();
        expect(created.canonicalName).toBe('Test Person');

        // Verify it's retrievable
        const fetched = await store.getPersonById(created.id);
        expect(fetched).toBeDefined();
        expect(fetched!.canonicalName).toBe('Test Person');
    });

    it('updatePerson updates an existing person', async () => {
        const bucky = await store.getPersonById('bucky-fuller')!;
        const updated = await store.updatePerson('bucky-fuller', { bioSummary: 'Updated bio' });
        expect(updated).toBeDefined();
        expect(updated!.bioSummary).toBe('Updated bio');
        expect(updated!.canonicalName).toBe(bucky!.canonicalName);

        // Restore original
        await store.updatePerson('bucky-fuller', { bioSummary: bucky!.bioSummary });
    });

    it('updatePerson returns undefined for unknown ID', async () => {
        expect(await store.updatePerson('nonexistent', { canonicalName: 'X' })).toBeUndefined();
    });

    it('deletePerson removes a person', async () => {
        const created = await store.createPerson({
            canonicalName: 'Deletable Person',
            occupations: [{ name: 'Test' }],
            confidence: 0.5,
        } as Omit<Person, 'id'>);

        expect(await store.deletePerson(created.id)).toBe(true);
        expect(await store.getPersonById(created.id)).toBeUndefined();
    });

    it('deletePerson returns false for unknown ID', async () => {
        expect(await store.deletePerson('nonexistent')).toBe(false);
    });
});

// ── Person Filters ──────────────────────────────────────────────────

describe('Person Filters', () => {
    it('search filter matches canonical name', async () => {
        const results = await store.getAllPersons({ search: 'Fuller' });
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(p => p.canonicalName.includes('Fuller'))).toBe(true);
    });

    it('search filter is case-insensitive', async () => {
        const results = await store.getAllPersons({ search: 'fuller' });
        expect(results.length).toBeGreaterThan(0);
    });

    it('search filter matches tags', async () => {
        // Find a person with tags and search for one
        const persons = await store.getAllPersons();
        const withTags = persons.find(p => p.tags && p.tags.length > 0);
        if (withTags && withTags.tags) {
            const results = await store.getAllPersons({ search: withTags.tags[0] });
            expect(results.length).toBeGreaterThan(0);
        }
    });

    it('domain filter returns only matching domain', async () => {
        const results = await store.getAllPersons({ domain: 'architecture' });
        for (const p of results) {
            expect(p.primaryDomain).toBe('architecture');
        }
    });

    it('minYear filter excludes earlier births', async () => {
        const results = await store.getAllPersons({ minYear: 1920 });
        for (const p of results) {
            if (p.birthDate) {
                const year = parseInt(p.birthDate.substring(0, 4));
                expect(year).toBeGreaterThanOrEqual(1920);
            }
        }
    });

    it('maxYear filter excludes later births', async () => {
        const results = await store.getAllPersons({ maxYear: 1900 });
        for (const p of results) {
            if (p.birthDate) {
                const year = parseInt(p.birthDate.substring(0, 4));
                expect(year).toBeLessThanOrEqual(1900);
            }
        }
    });

    it('combined filters narrow results', async () => {
        const all = await store.getAllPersons();
        const filtered = await store.getAllPersons({ domain: 'architecture', minYear: 1890 });
        expect(filtered.length).toBeLessThanOrEqual(all.length);
    });
});

// ── Edge CRUD ───────────────────────────────────────────────────────

describe('Edge CRUD', () => {
    it('getAllEdges returns all seed edges', async () => {
        const edges = await store.getAllEdges();
        expect(edges.length).toBeGreaterThanOrEqual(40);
    });

    it('getEdgeById returns an edge', async () => {
        const edges = await store.getAllEdges();
        const edge = await store.getEdgeById(edges[0].id);
        expect(edge).toBeDefined();
    });

    it('getEdgesForPerson returns edges for Fuller', async () => {
        const edges = await store.getEdgesForPerson('bucky-fuller');
        expect(edges.length).toBeGreaterThan(5);
    });

    it('getEdgesForPerson with type filter', async () => {
        const allEdges = await store.getEdgesForPerson('bucky-fuller');
        const filtered = await store.getEdgesForPerson('bucky-fuller', [EdgeType.COLLABORATED_WITH]);
        expect(filtered.length).toBeLessThanOrEqual(allEdges.length);
        for (const e of filtered) {
            expect(e.edgeType).toBe(EdgeType.COLLABORATED_WITH);
        }
    });

    it('createEdge creates and returns a new edge', async () => {
        const created = await store.createEdge({
            sourceId: 'bucky-fuller',
            targetId: 'john-cage',
            edgeType: EdgeType.CUSTOM,
            direction: EdgeDirection.BIDIRECTIONAL,
            confidence: 0.5,
        } as Omit<Edge, 'id'>);

        expect(created.id).toBeTruthy();
        expect(await store.getEdgeById(created.id)).toBeDefined();

        // Clean up
        await store.deleteEdge(created.id);
    });

    it('updateEdge updates an edge', async () => {
        const edges = await store.getAllEdges();
        const original = edges[0];
        const updated = await store.updateEdge(original.id, { confidence: 0.99 });
        expect(updated).toBeDefined();
        expect(updated!.confidence).toBe(0.99);

        // Restore
        await store.updateEdge(original.id, { confidence: original.confidence });
    });

    it('deleteEdge removes an edge', async () => {
        const created = await store.createEdge({
            sourceId: 'bucky-fuller',
            targetId: 'john-cage',
            edgeType: EdgeType.CUSTOM,
            direction: EdgeDirection.BIDIRECTIONAL,
            confidence: 0.5,
        } as Omit<Edge, 'id'>);

        expect(await store.deleteEdge(created.id)).toBe(true);
        expect(await store.getEdgeById(created.id)).toBeUndefined();
    });
});

// ── Events ──────────────────────────────────────────────────────────

describe('Events', () => {
    it('getEventsForPerson returns events for Fuller', async () => {
        const events = await store.getEventsForPerson('bucky-fuller');
        expect(events.length).toBeGreaterThan(0);
    });

    it('events are sorted chronologically', async () => {
        const events = await store.getEventsForPerson('bucky-fuller');
        for (let i = 1; i < events.length; i++) {
            expect(events[i].date >= events[i - 1].date).toBe(true);
        }
    });

    it('createEvent creates a new event', async () => {
        const created = await store.createEvent({
            personId: 'bucky-fuller',
            type: EventType.MILESTONE,
            title: 'Test Milestone',
            date: '1960-01-01',
        } as Omit<TemporalEvent, 'id'>);

        expect(created.id).toBeTruthy();
        expect(created.title).toBe('Test Milestone');
    });
});

// ── Ego Network ─────────────────────────────────────────────────────

describe('Ego Network', () => {
    it('returns center person and neighbors', async () => {
        const network = await store.getEgoNetwork('bucky-fuller');
        expect(network.center.id).toBe('bucky-fuller');
        expect(network.neighbors.length).toBeGreaterThan(5);
        expect(network.edges.length).toBeGreaterThan(5);
    });

    it('depth 1 returns direct connections', async () => {
        const network = await store.getEgoNetwork('bucky-fuller', 1);
        // All neighbors should have edges to bucky
        for (const neighbor of network.neighbors) {
            const hasEdge = network.edges.some(
                e => (e.sourceId === 'bucky-fuller' && e.targetId === neighbor.id) ||
                    (e.targetId === 'bucky-fuller' && e.sourceId === neighbor.id)
            );
            expect(hasEdge).toBe(true);
        }
    });

    it('depth 2 returns more nodes than depth 1', async () => {
        const net1 = await store.getEgoNetwork('bucky-fuller', 1);
        const net2 = await store.getEgoNetwork('bucky-fuller', 2);
        expect(net2.neighbors.length).toBeGreaterThanOrEqual(net1.neighbors.length);
    });

    it('edge type filter reduces results', async () => {
        const all = await store.getEgoNetwork('bucky-fuller');
        const filtered = await store.getEgoNetwork('bucky-fuller', 1, [EdgeType.COLLABORATED_WITH]);
        expect(filtered.neighbors.length).toBeLessThanOrEqual(all.neighbors.length);
    });

    it('throws for unknown person', async () => {
        await expect(store.getEgoNetwork('nonexistent')).rejects.toThrow('Person not found');
    });
});

// ── Shortest Path ───────────────────────────────────────────────────

describe('Shortest Path', () => {
    it('finds path between connected persons', async () => {
        const result = await store.findShortestPath('bucky-fuller', 'shoji-sadao');
        expect(result).not.toBeNull();
        expect(result!.path.length).toBeGreaterThanOrEqual(2);
        expect(result!.path[0].id).toBe('bucky-fuller');
        expect(result!.path[result!.path.length - 1].id).toBe('shoji-sadao');
        expect(result!.totalHops).toBe(result!.edges.length);
    });

    it('returns 0-hop path for same person', async () => {
        const result = await store.findShortestPath('bucky-fuller', 'bucky-fuller');
        expect(result).not.toBeNull();
        expect(result!.totalHops).toBe(0);
        expect(result!.path).toHaveLength(1);
    });

    it('returns null for unknown person', async () => {
        expect(await store.findShortestPath('nonexistent', 'bucky-fuller')).toBeNull();
    });

    it('path edges match path nodes', async () => {
        const result = await store.findShortestPath('bucky-fuller', 'john-cage');
        if (result && result.totalHops > 0) {
            expect(result.edges.length).toBe(result.path.length - 1);
        }
    });
});

// ── Timeline Data ───────────────────────────────────────────────────

describe('Timeline Data', () => {
    it('returns all persons when no filter', async () => {
        const data = await store.getTimelineData();
        expect(data.persons.length).toBeGreaterThanOrEqual(20);
    });

    it('returns filtered persons when IDs provided', async () => {
        const data = await store.getTimelineData(['bucky-fuller', 'john-cage']);
        expect(data.persons.length).toBe(2);
    });

    it('computes valid time range', async () => {
        const data = await store.getTimelineData();
        expect(data.timeRange.min).toBeLessThan(data.timeRange.max);
        expect(data.timeRange.min).toBeGreaterThan(1800);
        expect(data.timeRange.max).toBeLessThan(2100);
    });

    it('includes birth and death years', async () => {
        const data = await store.getTimelineData(['bucky-fuller']);
        const bucky = data.persons.find(p => p.id === 'bucky-fuller');
        expect(bucky).toBeDefined();
        expect(bucky!.birthYear).toBe(1895);
        expect(bucky!.deathYear).toBe(1983);
    });

    it('includes edges between timeline persons', async () => {
        const data = await store.getTimelineData();
        expect(data.edges.length).toBeGreaterThan(0);
    });
});

// ── Degree Computation ──────────────────────────────────────────────

describe('Degree Computation', () => {
    it('computes degrees for all connected persons', async () => {
        const degrees = await store.getDegreesMap();
        expect(degrees.size).toBeGreaterThan(0);
    });

    it('Fuller has the highest degree', async () => {
        const degrees = await store.getDegreesMap();
        const fullerDegree = degrees.get('bucky-fuller') || 0;
        expect(fullerDegree).toBeGreaterThan(5);

        for (const [id, degree] of degrees) {
            if (id !== 'bucky-fuller') {
                expect(fullerDegree).toBeGreaterThanOrEqual(degree);
            }
        }
    });

    it('all degrees are positive', async () => {
        const degrees = await store.getDegreesMap();
        for (const degree of degrees.values()) {
            expect(degree).toBeGreaterThan(0);
        }
    });
});

// ── Edge Update ─────────────────────────────────────────────────────

describe('Edge Update', () => {
    it('updateEdge modifies edge properties', async () => {
        const edges = await store.getAllEdges();
        const original = edges[0];
        const updated = await store.updateEdge(original.id, { description: 'Updated for test' });
        expect(updated).toBeDefined();
        expect(updated!.description).toBe('Updated for test');
        expect(updated!.id).toBe(original.id);
    });

    it('updateEdge preserves unmodified fields', async () => {
        const edges = await store.getAllEdges();
        const original = edges[0];
        const updated = await store.updateEdge(original.id, { description: 'Partial update' });
        expect(updated!.edgeType).toBe(original.edgeType);
        expect(updated!.sourceId).toBe(original.sourceId);
        expect(updated!.targetId).toBe(original.targetId);
        expect(updated!.confidence).toBe(original.confidence);
    });

    it('updateEdge returns undefined for nonexistent edge', async () => {
        const result = await store.updateEdge('nonexistent-edge', { description: 'nope' });
        expect(result).toBeUndefined();
    });
});

// ── Full Graph Assembly ─────────────────────────────────────────────

describe('Full Graph Assembly', () => {
    it('assembles a complete graph with nodes and edges', async () => {
        const persons = await store.getAllPersons();
        const edges = await store.getAllEdges();
        const degrees = await store.getDegreesMap();

        const nodes = persons.map(p => ({
            ...p,
            degree: degrees.get(p.id) || 0,
        }));

        expect(nodes.length).toBe(persons.length);
        expect(edges.length).toBeGreaterThan(0);

        // Every edge references valid persons
        const personIds = new Set(persons.map(p => p.id));
        for (const edge of edges) {
            expect(personIds.has(edge.sourceId)).toBe(true);
            expect(personIds.has(edge.targetId)).toBe(true);
        }
    });

    it('timeline includes living persons with null deathYear', async () => {
        const data = await store.getTimelineData();
        const living = data.persons.filter(p => p.deathYear === null || p.deathYear === undefined);
        expect(living.length).toBeGreaterThan(0);
    });
});
