/**
 * @module graphStore
 * @description Zustand store for all graph-related state: persons, edges, events,
 * selection, hover, filtering (categories, confidence, time window, search),
 * and computed selectors. This is the single source of truth for the graph
 * visualization and all sidebar panels.
 */

import { create } from 'zustand';
import type { Person, Edge, TemporalEvent } from 'shared';
import { EdgeCategory, EDGE_TYPE_TO_CATEGORY, DEFAULT_VISIBLE_CATEGORIES } from 'shared';

/**
 * Complete state shape for the graph store.
 * Groups:
 * - **Data**: persons, edges, events, loading, error
 * - **Selection**: selectedPersonId, selectedEdgeId, hoveredPersonId
 * - **Filters**: visibleCategories, confidenceFloor, timeWindow, searchQuery
 * - **Actions**: setters, togglers, and state mutators
 * - **Computed**: derived selectors (getFilteredEdges, getSelectedPerson, getSelectedEdge)
 */
interface GraphState {

    // Data
    persons: Person[];
    edges: Edge[];
    events: TemporalEvent[];
    loading: boolean;
    error: string | null;

    // Selection
    selectedPersonId: string | null;
    selectedEdgeId: string | null;
    hoveredPersonId: string | null;

    // Filters
    visibleCategories: Record<EdgeCategory, boolean>;
    confidenceFloor: number;
    timeWindowStart: number | null;
    timeWindowEnd: number | null;
    searchQuery: string;

    // Actions
    setPersons: (persons: Person[]) => void;
    setEdges: (edges: Edge[]) => void;
    setEvents: (events: TemporalEvent[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    selectPerson: (id: string | null) => void;
    selectEdge: (id: string | null) => void;
    hoverPerson: (id: string | null) => void;
    toggleCategory: (category: EdgeCategory) => void;
    setVisibleCategories: (categories: Record<EdgeCategory, boolean>) => void;
    setConfidenceFloor: (floor: number) => void;
    setTimeWindow: (start: number | null, end: number | null) => void;
    setSearchQuery: (query: string) => void;

    // Computed
    getFilteredEdges: () => Edge[];
    getSelectedPerson: () => Person | undefined;
    getSelectedEdge: () => Edge | undefined;
}

export const useGraphStore = create<GraphState>((set, get) => ({
    persons: [],
    edges: [],
    events: [],
    loading: true,
    error: null,
    selectedPersonId: null,
    selectedEdgeId: null,
    hoveredPersonId: null,
    visibleCategories: { ...DEFAULT_VISIBLE_CATEGORIES },
    confidenceFloor: 0,
    timeWindowStart: null,
    timeWindowEnd: null,
    searchQuery: '',

    setPersons: (persons) => set({ persons }),
    setEdges: (edges) => set({ edges }),
    setEvents: (events) => set({ events }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    selectPerson: (id) => set({ selectedPersonId: id, selectedEdgeId: null }),
    selectEdge: (id) => set({ selectedEdgeId: id, selectedPersonId: null }),
    hoverPerson: (id) => set({ hoveredPersonId: id }),
    toggleCategory: (category) => set((state) => ({
        visibleCategories: {
            ...state.visibleCategories,
            [category]: !state.visibleCategories[category],
        },
    })),
    setVisibleCategories: (categories) => set({ visibleCategories: categories }),
    setConfidenceFloor: (floor) => set({ confidenceFloor: floor }),
    setTimeWindow: (start, end) => set({ timeWindowStart: start, timeWindowEnd: end }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    getFilteredEdges: () => {
        const state = get();
        return state.edges.filter(edge => {
            // Category filter
            const category = EDGE_TYPE_TO_CATEGORY[edge.edgeType];
            if (!state.visibleCategories[category]) return false;
            // Confidence filter
            if (edge.confidence < state.confidenceFloor) return false;
            // Time window filter
            if (state.timeWindowStart !== null || state.timeWindowEnd !== null) {
                const edgeStart = edge.startDate ? parseInt(edge.startDate.substring(0, 4)) : null;
                const edgeEnd = edge.endDate ? parseInt(edge.endDate.substring(0, 4)) : null;
                if (state.timeWindowStart !== null && edgeEnd !== null && edgeEnd < state.timeWindowStart) return false;
                if (state.timeWindowEnd !== null && edgeStart !== null && edgeStart > state.timeWindowEnd) return false;
            }
            return true;
        });
    },

    getSelectedPerson: () => {
        const state = get();
        return state.persons.find(p => p.id === state.selectedPersonId);
    },

    getSelectedEdge: () => {
        const state = get();
        return state.edges.find(e => e.id === state.selectedEdgeId);
    },
}));
