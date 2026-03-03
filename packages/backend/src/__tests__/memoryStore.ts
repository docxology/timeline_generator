/**
 * @module memoryStore
 * @description In-memory IGraphStore implementation for unit testing.
 * NOT used in production — the server uses Neo4jStore exclusively.
 * Kept here so that `vitest` can run without a live Neo4j instance.
 */

import type { Person, Edge, TemporalEvent, TimelineData, PathResult, NetworkResponse } from 'shared';
import { EdgeType } from 'shared';
import { v4 as uuid } from 'uuid';
import { seedPersons, seedEdges, seedEvents } from 'seed-data';
import { IGraphStore } from '../store.js';

/**
 * In-memory graph store for fast, isolated unit testing.
 * Loads seed data on construction and implements the full IGraphStore interface.
 */
export class MemoryStore implements IGraphStore {
    private persons: Map<string, Person> = new Map();
    private edges: Map<string, Edge> = new Map();
    private events: Map<string, TemporalEvent> = new Map();

    constructor() {
        for (const p of seedPersons) this.persons.set(p.id, p);
        for (const e of seedEdges) this.edges.set(e.id, e);
        for (const ev of seedEvents) this.events.set(ev.id, ev);
        console.log(`[Store] Loaded ${this.persons.size} persons, ${this.edges.size} edges, ${this.events.size} events`);
    }

    async getAllPersons(filters?: { search?: string; domain?: string; minYear?: number; maxYear?: number; }): Promise<Person[]> {
        let result = Array.from(this.persons.values());
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(p =>
                p.canonicalName.toLowerCase().includes(q) ||
                p.alternateNames?.some(n => n.toLowerCase().includes(q)) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            );
        }
        if (filters?.domain) result = result.filter(p => p.primaryDomain === filters.domain);
        if (filters?.minYear) result = result.filter(p => { const y = p.birthDate ? parseInt(p.birthDate.substring(0, 4)) : null; return y === null || y >= filters.minYear!; });
        if (filters?.maxYear) result = result.filter(p => { const y = p.birthDate ? parseInt(p.birthDate.substring(0, 4)) : null; return y === null || y <= filters.maxYear!; });
        return result;
    }

    async getPersonById(id: string): Promise<Person | undefined> { return this.persons.get(id); }

    async createPerson(data: Omit<Person, 'id'>): Promise<Person> {
        const person: Person = { ...data, id: uuid() };
        this.persons.set(person.id, person);
        console.log(`[Store] Created person: ${person.canonicalName} (${person.id})`);
        return person;
    }

    async updatePerson(id: string, data: Partial<Person>): Promise<Person | undefined> {
        const existing = this.persons.get(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...data, id };
        this.persons.set(id, updated);
        console.log(`[Store] Updated person: ${updated.canonicalName} (${id})`);
        return updated;
    }

    async deletePerson(id: string): Promise<boolean> {
        const result = this.persons.delete(id);
        if (result) console.log(`[Store] Deleted person: ${id}`);
        return result;
    }

    async getAllEdges(): Promise<Edge[]> { return Array.from(this.edges.values()); }
    async getEdgeById(id: string): Promise<Edge | undefined> { return this.edges.get(id); }

    async getEdgesForPerson(personId: string, edgeTypes?: EdgeType[]): Promise<Edge[]> {
        return Array.from(this.edges.values()).filter(e => {
            const matches = e.sourceId === personId || e.targetId === personId;
            if (!matches) return false;
            if (edgeTypes && edgeTypes.length > 0) return edgeTypes.includes(e.edgeType);
            return true;
        });
    }

    async createEdge(data: Omit<Edge, 'id'>): Promise<Edge> {
        const edge: Edge = { ...data, id: uuid() };
        this.edges.set(edge.id, edge);
        console.log(`[Store] Created edge: ${edge.sourceId} -[${edge.edgeType}]-> ${edge.targetId}`);
        return edge;
    }

    async updateEdge(id: string, data: Partial<Edge>): Promise<Edge | undefined> {
        const existing = this.edges.get(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...data, id };
        this.edges.set(id, updated);
        return updated;
    }

    async deleteEdge(id: string): Promise<boolean> { return this.edges.delete(id); }

    async getEventsForPerson(personId: string): Promise<TemporalEvent[]> {
        return Array.from(this.events.values())
            .filter(e => e.personId === personId)
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    async createEvent(data: Omit<TemporalEvent, 'id'>): Promise<TemporalEvent> {
        const event: TemporalEvent = { ...data, id: uuid() };
        this.events.set(event.id, event);
        console.log(`[Store] Created event: ${event.title} for ${event.personId}`);
        return event;
    }

    async getEgoNetwork(personId: string, depth: number = 1, edgeTypes?: EdgeType[]): Promise<NetworkResponse> {
        const center = this.persons.get(personId);
        if (!center) throw new Error(`Person not found: ${personId}`);
        const visited = new Set<string>([personId]);
        const resultEdges: Edge[] = [];
        let frontier = [personId];
        for (let d = 0; d < depth; d++) {
            const nextFrontier: string[] = [];
            for (const nodeId of frontier) {
                const edges = await this.getEdgesForPerson(nodeId, edgeTypes);
                for (const edge of edges) {
                    if (!resultEdges.find(e => e.id === edge.id)) resultEdges.push(edge);
                    const neighbor = edge.sourceId === nodeId ? edge.targetId : edge.sourceId;
                    if (!visited.has(neighbor)) { visited.add(neighbor); nextFrontier.push(neighbor); }
                }
            }
            frontier = nextFrontier;
        }
        const neighbors = Array.from(visited).filter(id => id !== personId).map(id => this.persons.get(id)!).filter(Boolean);
        return { center, neighbors, edges: resultEdges };
    }

    async findShortestPath(fromId: string, toId: string): Promise<PathResult | null> {
        if (!this.persons.has(fromId) || !this.persons.has(toId)) return null;
        if (fromId === toId) return { path: [this.persons.get(fromId)!], edges: [], totalHops: 0 };
        const visited = new Set<string>([fromId]);
        const parent = new Map<string, { personId: string; edge: Edge }>();
        const queue = [fromId];
        while (queue.length > 0) {
            const current = queue.shift()!;
            const edges = await this.getEdgesForPerson(current);
            for (const edge of edges) {
                const neighbor = edge.sourceId === current ? edge.targetId : edge.sourceId;
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent.set(neighbor, { personId: current, edge });
                    if (neighbor === toId) {
                        const path: Person[] = []; const pathEdges: Edge[] = []; let cur = toId;
                        while (cur !== fromId) { path.unshift(this.persons.get(cur)!); const p = parent.get(cur)!; pathEdges.unshift(p.edge); cur = p.personId; }
                        path.unshift(this.persons.get(fromId)!);
                        return { path, edges: pathEdges, totalHops: pathEdges.length };
                    }
                    queue.push(neighbor);
                }
            }
        }
        return null;
    }

    async getTimelineData(personIds?: string[]): Promise<TimelineData> {
        const persons = personIds ? personIds.map(id => this.persons.get(id)).filter(Boolean) as Person[] : Array.from(this.persons.values());
        const personIdSet = new Set(persons.map(p => p.id));
        let minYear = Infinity, maxYear = -Infinity;
        const timelinePersons = persons.map(p => {
            const birthYear = p.birthDate ? parseInt(p.birthDate.substring(0, 4)) : null;
            const deathYear = p.deathDate ? parseInt(p.deathDate.substring(0, 4)) : null;
            if (birthYear !== null && birthYear < minYear) minYear = birthYear;
            if (deathYear !== null && deathYear > maxYear) maxYear = deathYear;
            if (birthYear !== null && deathYear === null && 2026 > maxYear) maxYear = 2026;
            const events = Array.from(this.events.values()).filter(e => e.personId === p.id).sort((a, b) => a.date.localeCompare(b.date));
            return { id: p.id, name: p.canonicalName, birthYear, deathYear, domain: p.primaryDomain || 'default', events };
        });
        const timelineEdges = Array.from(this.edges.values()).filter(e => personIdSet.has(e.sourceId) && personIdSet.has(e.targetId)).map(e => ({
            id: e.id, sourceId: e.sourceId, targetId: e.targetId, type: e.edgeType,
            startYear: e.startDate ? parseInt(e.startDate.substring(0, 4)) : null,
            endYear: e.endDate ? parseInt(e.endDate.substring(0, 4)) : null, confidence: e.confidence,
        }));
        return { persons: timelinePersons, edges: timelineEdges, timeRange: { min: minYear === Infinity ? 1850 : minYear, max: maxYear === -Infinity ? 2025 : maxYear } };
    }

    async getDegreesMap(): Promise<Map<string, number>> {
        const degrees = new Map<string, number>();
        for (const edge of this.edges.values()) {
            degrees.set(edge.sourceId, (degrees.get(edge.sourceId) || 0) + 1);
            degrees.set(edge.targetId, (degrees.get(edge.targetId) || 0) + 1);
        }
        return degrees;
    }

    async getCounts(): Promise<{ persons: number; edges: number; events: number }> {
        return { persons: this.persons.size, edges: this.edges.size, events: this.events.size };
    }
}
