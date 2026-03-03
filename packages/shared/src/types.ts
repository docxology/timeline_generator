/**
 * @module types
 * @description TypeScript interfaces for all Timeline Generator entities.
 * These mirror the Zod schemas in `schemas.ts` but as pure TypeScript types
 * for use in application code without runtime validation overhead.
 */

import { EdgeType, EdgeDirection, EventType, DatePrecision } from './constants';

// ─── Geo Location ───────────────────────────────────────────────────

/** Geographic location with optional coordinates for mapping. */
export interface Place {
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lng?: number;
}

// ─── Source / Provenance ────────────────────────────────────────────

/** Provenance record linking data to its documentary source. */
export interface Source {
    id: string;
    url?: string;
    title?: string;
    quote?: string;
    accessDate?: string;
    contributor?: string;
}

// ─── Affiliation ────────────────────────────────────────────────────

/** Institutional affiliation with optional temporal bounds. */
export interface Affiliation {
    name: string;
    role?: string;
    start?: string;
    end?: string;
}

// ─── Occupation ─────────────────────────────────────────────────────

/** Professional occupation with optional domain classification. */
export interface Occupation {
    name: string;
    domain?: string;
    start?: string;
    end?: string;
}

// ─── Major Work ─────────────────────────────────────────────────────

/** Notable work product (book, paper, patent, artwork, invention). */
export interface MajorWork {
    title: string;
    year?: number;
    type?: 'book' | 'paper' | 'patent' | 'artwork' | 'invention' | 'other';
}

// ─── Person Node (§2.1) ────────────────────────────────────────────

/**
 * Primary entity in the knowledge graph representing a historical person.
 * Contains biographical data, affiliations, provenance, and domain classification.
 * @property id - Unique identifier (auto-generated UUID slug).
 * @property canonicalName - Display name used in the graph.
 * @property confidence - Epistemic confidence score [0, 1].
 * @property primaryDomain - Domain key for node coloring.
 */
export interface Person {
    id: string;
    canonicalName: string;
    alternateNames?: string[];
    birthDate?: string;
    birthDatePrecision?: DatePrecision;
    birthPlace?: Place;
    deathDate?: string;
    deathDatePrecision?: DatePrecision;
    deathPlace?: Place;
    gender?: string;
    nationalities?: Array<{ name: string; start?: string; end?: string }>;
    occupations: Occupation[];
    affiliations?: Affiliation[];
    bioSummary?: string;
    bioLong?: string;
    imageUrl?: string;
    wikidataId?: string;
    wikipediaSlug?: string;
    confidence: number;
    provenance?: Source[];
    tags?: string[];
    primaryDomain?: string;
    customFields?: Record<string, unknown>;
}

// ─── Temporal Event (§2.2) ─────────────────────────────────────────

/**
 * A dated event associated with a person's life.
 * Rendered in the timeline visualization and sorted chronologically.
 * @property personId - Foreign key to the parent Person.
 * @property type - Event classification (BIRTH, DEATH, PUBLICATION, etc.).
 * @property date - ISO date string (YYYY, YYYY-MM, or YYYY-MM-DD).
 */
export interface TemporalEvent {
    id: string;
    personId: string;
    type: EventType;
    title: string;
    description?: string;
    date: string;
    datePrecision?: DatePrecision;
    endDate?: string;
    place?: Place;
    confidence?: number;
    provenance?: Source[];
    tags?: string[];
}

// ─── Relationship Edge (§2.3) ──────────────────────────────────────

/**
 * Typed relationship connecting two person nodes in the knowledge graph.
 * Carries metadata for visualization (color, weight) and provenance (evidence).
 * @property sourceId - ID of the originating person.
 * @property targetId - ID of the destination person.
 * @property edgeType - Relationship classification from the 24-type taxonomy.
 * @property confidence - Epistemic confidence score [0, 1].
 */
export interface Edge {
    id: string;
    sourceId: string;
    targetId: string;
    edgeType: EdgeType;
    customLabel?: string;
    direction: EdgeDirection;
    startDate?: string;
    endDate?: string;
    strength?: number;
    confidence: number;
    description?: string;
    evidence?: Source[];
    tags?: string[];
    colorOverride?: string;
    weightOverride?: number;
}

// ─── Focal Graph (§2.4) ────────────────────────────────────────────

/**
 * Saved graph view — a curated subset of people and edges with layout state.
 * Used for bookmarking and sharing specific graph explorations.
 */
export interface FocalGraph {
    id: string;
    name: string;
    description?: string;
    personIds: string[];
    edgeIds: string[];
    visibleLayers?: string[];
    timeWindowStart?: string;
    timeWindowEnd?: string;
    layoutMode?: 'force' | 'hierarchical' | 'timeline';
    createdAt: string;
    updatedAt: string;
}

// ─── API Response Types ─────────────────────────────────────────────

/** Response from the ego network endpoint (center person + neighbors + connecting edges). */
export interface NetworkResponse {
    center: Person;
    neighbors: Person[];
    edges: Edge[];
}

/** Aggregated timeline data for the SVG timeline visualization. */
export interface TimelineData {
    persons: Array<{
        id: string;
        name: string;
        birthYear: number | null;
        deathYear: number | null;
        domain: string;
        events: TemporalEvent[];
    }>;
    edges: Array<{
        id: string;
        sourceId: string;
        targetId: string;
        type: EdgeType;
        startYear: number | null;
        endYear: number | null;
        confidence: number;
    }>;
    timeRange: { min: number; max: number };
}

/** Result of a shortest-path BFS query between two persons. */
export interface PathResult {
    path: Person[];
    edges: Edge[];
    totalHops: number;
}

/** Result of a Perplexity-powered research enrichment. */
export interface EnrichmentResult {
    person: Partial<Person>;
    suggestedEdges: Array<Partial<Edge> & { targetName: string }>;
    confidence: number;
    source: string;
}

// ─── Graph Node/Link for D3 ────────────────────────────────────────

/** D3-compatible graph node extending Person with simulation coordinates. */
export interface GraphNode extends Person {
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
    degree?: number;
}

/** D3-compatible graph link pairing source/target nodes with edge metadata. */
export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    edge: Edge;
}
