/**
 * @module store
 * @description Graph store interface and singleton management.
 * Defines the IGraphStore contract that all storage engines must implement.
 * The active store instance is set at server boot by the initialization logic.
 */

import type { Person, Edge, TemporalEvent, TimelineData, PathResult, NetworkResponse } from 'shared';
import { EdgeType } from 'shared';

// ─── IGraphStore Interface ────────────────────────────────────────────

/**
 * Abstract storage interface for the Timeline Generator graph database.
 * Implemented by Neo4jStore for production use.
 */
export interface IGraphStore {
    /** Retrieve all persons with optional filters. */
    getAllPersons(filters?: { search?: string; domain?: string; minYear?: number; maxYear?: number; }): Promise<Person[]>;
    /** Get a single person by ID. */
    getPersonById(id: string): Promise<Person | undefined>;
    /** Create a new person with an auto-generated UUID. */
    createPerson(data: Omit<Person, 'id'>): Promise<Person>;
    /** Update an existing person by merging partial data. */
    updatePerson(id: string, data: Partial<Person>): Promise<Person | undefined>;
    /** Delete a person by ID. */
    deletePerson(id: string): Promise<boolean>;

    /** Get all edges in the store. */
    getAllEdges(): Promise<Edge[]>;
    /** Get a single edge by ID. */
    getEdgeById(id: string): Promise<Edge | undefined>;
    /** Get all edges connected to a specific person, optionally filtered by type. */
    getEdgesForPerson(personId: string, edgeTypes?: EdgeType[]): Promise<Edge[]>;
    /** Create a new edge with an auto-generated UUID. */
    createEdge(data: Omit<Edge, 'id'>): Promise<Edge>;
    /** Update an existing edge by merging partial data. */
    updateEdge(id: string, data: Partial<Edge>): Promise<Edge | undefined>;
    /** Delete an edge by ID. */
    deleteEdge(id: string): Promise<boolean>;

    /** Get all temporal events for a specific person, sorted chronologically. */
    getEventsForPerson(personId: string): Promise<TemporalEvent[]>;
    /** Create a new temporal event with an auto-generated UUID. */
    createEvent(data: Omit<TemporalEvent, 'id'>): Promise<TemporalEvent>;

    /** Compute the ego network around a focal person. */
    getEgoNetwork(personId: string, depth?: number, edgeTypes?: EdgeType[]): Promise<NetworkResponse>;
    /** Find the shortest path between two persons. */
    findShortestPath(fromId: string, toId: string): Promise<PathResult | null>;
    /** Generate timeline-ready data with year calculations. */
    getTimelineData(personIds?: string[]): Promise<TimelineData>;
    /** Compute the degree (number of connected edges) for every person. */
    getDegreesMap(): Promise<Map<string, number>>;
    /** Get counts of all entities in the store. */
    getCounts(): Promise<{ persons: number; edges: number; events: number }>;
}

// ─── Singleton Store Instance ─────────────────────────────────────────

/** The active graph store instance. Set during server initialization. */
let _store: IGraphStore | null = null;

/**
 * Get the active graph store. Throws if not initialized.
 * @returns The active IGraphStore implementation.
 */
export function getStore(): IGraphStore {
    if (!_store) throw new Error('Graph store not initialized. Server must call setGraphStore() first.');
    return _store;
}

/**
 * Set the active graph store instance.
 * Called once during server boot to inject the Neo4jStore.
 */
export function setGraphStore(newStore: IGraphStore): void {
    _store = newStore;
    console.log('[Store] Active graph store set');
}

/**
 * Proxy export that routes call for convenience.
 * Routes import this and call methods on it.
 */
export const store = new Proxy({} as IGraphStore, {
    get(_target, prop) {
        return (getStore() as any)[prop];
    },
});
