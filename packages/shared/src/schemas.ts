/**
 * @module schemas
 * @description Zod validation schemas for all Timeline Generator entities.
 * Each schema provides runtime validation with type inference.
 * Create/Update variants omit auto-generated fields (id, timestamps).
 */

import { z } from 'zod';
import { EdgeType, EdgeDirection, EventType, DatePrecision } from './constants';

// ─── Place Schema ───────────────────────────────────────────────────

/**
 * Geographic location with optional coordinates.
 * Used for birth/death places and event locations.
 * @example { city: "Milton, MA", country: "USA", lat: 42.25, lng: -71.07 }
 */
export const PlaceSchema = z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

// ─── Source Schema ──────────────────────────────────────────────────

/**
 * Provenance record linking data to its source material.
 * Enables epistemic confidence scoring and audit trails.
 * @example { id: "src-wiki-fuller", url: "https://en.wikipedia.org/wiki/...", title: "Wikipedia" }
 */
export const SourceSchema = z.object({
    id: z.string(),
    url: z.string().optional(),
    title: z.string().optional(),
    quote: z.string().optional(),
    accessDate: z.string().optional(),
    contributor: z.string().optional(),
});

// ─── Person Schema ──────────────────────────────────────────────────

/**
 * Complete person node with biographical data, affiliations, and provenance.
 * This is the primary entity in the knowledge graph.
 * - `confidence` must be between 0 and 1 (inclusive).
 * - `occupations` is required (at least empty array).
 * - `primaryDomain` determines the node color in the graph visualization.
 * @see PersonSchema.parse() for runtime validation
 */
export const PersonSchema = z.object({
    id: z.string(),
    canonicalName: z.string(),
    alternateNames: z.array(z.string()).optional(),
    birthDate: z.string().optional(),
    birthDatePrecision: z.nativeEnum(DatePrecision).optional(),
    birthPlace: PlaceSchema.optional(),
    deathDate: z.string().optional(),
    deathDatePrecision: z.nativeEnum(DatePrecision).optional(),
    deathPlace: PlaceSchema.optional(),
    gender: z.string().optional(),
    nationalities: z.array(z.object({
        name: z.string(),
        start: z.string().optional(),
        end: z.string().optional(),
    })).optional(),
    occupations: z.array(z.object({
        name: z.string(),
        domain: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
    })),
    affiliations: z.array(z.object({
        name: z.string(),
        role: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
    })).optional(),
    bioSummary: z.string().optional(),
    bioLong: z.string().optional(),
    imageUrl: z.string().optional(),
    wikidataId: z.string().optional(),
    wikipediaSlug: z.string().optional(),
    confidence: z.number().min(0).max(1),
    provenance: z.array(SourceSchema).optional(),
    tags: z.array(z.string()).optional(),
    primaryDomain: z.string().optional(),
    customFields: z.record(z.unknown()).optional(),
});

// ─── Event Schema ───────────────────────────────────────────────────

/**
 * Temporal event attached to a person.
 * Events are sorted chronologically in the timeline visualization.
 * - `type` must be a valid EventType enum value.
 * - `date` is required; `endDate` is optional for spans.
 * @see TemporalEventSchema.parse() for runtime validation
 */
export const TemporalEventSchema = z.object({
    id: z.string(),
    personId: z.string(),
    type: z.nativeEnum(EventType),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    datePrecision: z.nativeEnum(DatePrecision).optional(),
    endDate: z.string().optional(),
    place: PlaceSchema.optional(),
    confidence: z.number().min(0).max(1).optional(),
    provenance: z.array(SourceSchema).optional(),
    tags: z.array(z.string()).optional(),
});

// ─── Edge Schema ────────────────────────────────────────────────────

/**
 * Relationship edge connecting two person nodes.
 * Edges carry rich metadata including type, direction, confidence, and temporal bounds.
 * - `edgeType` must be a valid EdgeType enum value.
 * - `direction` is DIRECTED or BIDIRECTIONAL.
 * - `confidence` must be between 0 and 1 (inclusive).
 * @see EdgeSchema.parse() for runtime validation
 */
export const EdgeSchema = z.object({
    id: z.string(),
    sourceId: z.string(),
    targetId: z.string(),
    edgeType: z.nativeEnum(EdgeType),
    customLabel: z.string().optional(),
    direction: z.nativeEnum(EdgeDirection),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    strength: z.number().min(0).max(1).optional(),
    confidence: z.number().min(0).max(1),
    description: z.string().optional(),
    evidence: z.array(SourceSchema).optional(),
    tags: z.array(z.string()).optional(),
    colorOverride: z.string().optional(),
    weightOverride: z.number().optional(),
});

// ─── Focal Graph Schema ────────────────────────────────────────────

/**
 * Saved graph view configuration.
 * Stores a curated subset of persons and edges with visualization settings.
 * Used for bookmarking and sharing specific graph explorations.
 */
export const FocalGraphSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    personIds: z.array(z.string()),
    edgeIds: z.array(z.string()),
    visibleLayers: z.array(z.string()).optional(),
    timeWindowStart: z.string().optional(),
    timeWindowEnd: z.string().optional(),
    layoutMode: z.enum(['force', 'hierarchical', 'timeline']).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// ─── Create/Update Variants (omit id, timestamps) ──────────────────

/** Schema for creating a new person (no id required — auto-generated). */
export const CreatePersonSchema = PersonSchema.omit({ id: true });

/** Schema for partially updating an existing person. */
export const UpdatePersonSchema = PersonSchema.partial().omit({ id: true });

/** Schema for creating a new edge (no id required — auto-generated). */
export const CreateEdgeSchema = EdgeSchema.omit({ id: true });

/** Schema for partially updating an existing edge. */
export const UpdateEdgeSchema = EdgeSchema.partial().omit({ id: true });

/** Schema for creating a new temporal event (no id required — auto-generated). */
export const CreateEventSchema = TemporalEventSchema.omit({ id: true });
