const API_BASE = '/api';

/**
 * Typed fetch wrapper with error handling.
 * @param url - API path (appended to /api base).
 * @param options - Standard fetch options.
 * @returns Parsed JSON response.
 * @throws Error with server error message.
 */
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {};
    if (options?.body) {
        headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_BASE}${url}`, {
        headers,
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error.error || `API Error: ${res.status}`);
    }
    return res.json();
}

export const api = {
    // ── Graph ────────────────────────────────────────────────────────
    /** Fetch the full graph dataset (nodes + links) for D3 visualization. */
    getFullGraph: () => fetchJSON<any>('/graph/full'),

    /** Fetch timeline data for lifespan bar rendering. */
    getTimeline: (personIds?: string[]) => {
        const params = personIds ? `?personIds=${personIds.join(',')}` : '';
        return fetchJSON<any>(`/timeline${params}`);
    },

    /** Find the shortest path between two persons via BFS. */
    findPath: (from: string, to: string) => fetchJSON<any>(`/paths?from=${from}&to=${to}`),

    // ── Persons ──────────────────────────────────────────────────────
    /** List all persons with optional search filter. */
    getPersons: (search?: string) => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return fetchJSON<any>(`/persons${params}`);
    },

    /** Get a single person by ID. */
    getPerson: (id: string) => fetchJSON<any>(`/persons/${id}`),

    /** Get temporal events for a specific person. */
    getPersonEvents: (id: string) => fetchJSON<any>(`/persons/${id}/events`),

    /** Get ego network around a person at configurable depth. */
    getPersonNetwork: (id: string, depth?: number) => {
        const params = depth ? `?depth=${depth}` : '';
        return fetchJSON<any>(`/persons/${id}/network${params}`);
    },

    /** Create a new person. */
    createPerson: (data: any) => fetchJSON<any>('/persons', { method: 'POST', body: JSON.stringify(data) }),

    /** Update an existing person with partial data. */
    updatePerson: (id: string, data: any) => fetchJSON<any>(`/persons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    // ── Edges ────────────────────────────────────────────────────────
    /** Get a single edge by ID. */
    getEdge: (id: string) => fetchJSON<any>(`/edges/${id}`),

    /** Create a new relationship edge. */
    createEdge: (data: any) => fetchJSON<any>('/edges', { method: 'POST', body: JSON.stringify(data) }),

    /** Update an existing edge with partial data. */
    updateEdge: (id: string, data: any) => fetchJSON<any>(`/edges/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    // ── Research ─────────────────────────────────────────────────────
    /**
     * Research a person using Perplexity API.
     * @param query - Person name or search query.
     * @param addToGraph - Whether to auto-create the person and edges in the graph.
     * @returns Research results with structured biography, connections, and events.
     */
    research: (query: string, addToGraph: boolean = false) =>
        fetchJSON<any>('/research', {
            method: 'POST',
            body: JSON.stringify({ query, addToGraph }),
        }),

    /**
     * Enrich an existing person with additional research from Perplexity.
     * @param id - The person's ID to enrich.
     * @returns Research results for the existing person.
     */
    enrichPerson: (id: string) =>
        fetchJSON<any>(`/research/enrich/${id}`, { method: 'POST' }),
};
