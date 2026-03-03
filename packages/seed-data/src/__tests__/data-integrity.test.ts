import { describe, it, expect } from 'vitest';
import { seedPersons } from '../persons';
import { seedEdges } from '../edges';
import { seedEvents } from '../events';
import { PersonSchema, EdgeSchema, TemporalEventSchema, EdgeType, EDGE_TYPE_TO_CATEGORY } from 'shared';

describe('Seed Data Integrity', () => {
    // ── Existence ────────────────────────────────────────────────────

    it('has persons', () => {
        expect(seedPersons.length).toBeGreaterThan(0);
    });

    it('has edges', () => {
        expect(seedEdges.length).toBeGreaterThan(0);
    });

    it('has events', () => {
        expect(seedEvents.length).toBeGreaterThan(0);
    });

    // ── Counts ───────────────────────────────────────────────────────

    it('has at least 20 persons', () => {
        expect(seedPersons.length).toBeGreaterThanOrEqual(20);
    });

    it('has at least 40 edges', () => {
        expect(seedEdges.length).toBeGreaterThanOrEqual(40);
    });

    it('has at least 40 events', () => {
        expect(seedEvents.length).toBeGreaterThanOrEqual(40);
    });

    // ── Unique IDs ──────────────────────────────────────────────────

    it('all person IDs are unique', () => {
        const ids = seedPersons.map(p => p.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all edge IDs are unique', () => {
        const ids = seedEdges.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all event IDs are unique', () => {
        const ids = seedEvents.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    // ── Referential Integrity ───────────────────────────────────────

    it('all edge sourceIds reference existing persons', () => {
        const personIds = new Set(seedPersons.map(p => p.id));
        for (const edge of seedEdges) {
            expect(
                personIds.has(edge.sourceId),
                `Edge ${edge.id}: sourceId "${edge.sourceId}" not found in persons`
            ).toBe(true);
        }
    });

    it('all edge targetIds reference existing persons', () => {
        const personIds = new Set(seedPersons.map(p => p.id));
        for (const edge of seedEdges) {
            expect(
                personIds.has(edge.targetId),
                `Edge ${edge.id}: targetId "${edge.targetId}" not found in persons`
            ).toBe(true);
        }
    });

    it('all event personIds reference existing persons', () => {
        const personIds = new Set(seedPersons.map(p => p.id));
        for (const event of seedEvents) {
            expect(
                personIds.has(event.personId),
                `Event ${event.id}: personId "${event.personId}" not found in persons`
            ).toBe(true);
        }
    });

    // ── Self-Loops ──────────────────────────────────────────────────

    it('no edges are self-loops', () => {
        for (const edge of seedEdges) {
            expect(
                edge.sourceId !== edge.targetId,
                `Edge ${edge.id} is a self-loop on "${edge.sourceId}"`
            ).toBe(true);
        }
    });

    // ── Confidence Bounds ───────────────────────────────────────────

    it('all person confidences are in [0, 1]', () => {
        for (const p of seedPersons) {
            expect(p.confidence).toBeGreaterThanOrEqual(0);
            expect(p.confidence).toBeLessThanOrEqual(1);
        }
    });

    it('all edge confidences are in [0, 1]', () => {
        for (const e of seedEdges) {
            expect(e.confidence).toBeGreaterThanOrEqual(0);
            expect(e.confidence).toBeLessThanOrEqual(1);
        }
    });

    // ── Date Consistency ────────────────────────────────────────────

    it('birth dates precede death dates for all persons', () => {
        for (const p of seedPersons) {
            if (p.birthDate && p.deathDate) {
                const birth = parseInt(p.birthDate.substring(0, 4));
                const death = parseInt(p.deathDate.substring(0, 4));
                expect(
                    birth <= death,
                    `${p.canonicalName}: birth ${birth} > death ${death}`
                ).toBe(true);
            }
        }
    });

    // ── Schema Validation ───────────────────────────────────────────

    it('all persons pass PersonSchema validation', () => {
        for (const person of seedPersons) {
            const result = PersonSchema.safeParse(person);
            expect(
                result.success,
                `Person ${person.id} failed validation: ${!result.success ? JSON.stringify(result.error.issues) : ''}`
            ).toBe(true);
        }
    });

    it('all edges pass EdgeSchema validation', () => {
        for (const edge of seedEdges) {
            const result = EdgeSchema.safeParse(edge);
            expect(
                result.success,
                `Edge ${edge.id} failed validation: ${!result.success ? JSON.stringify(result.error.issues) : ''}`
            ).toBe(true);
        }
    });

    it('all events pass TemporalEventSchema validation', () => {
        for (const event of seedEvents) {
            const result = TemporalEventSchema.safeParse(event);
            expect(
                result.success,
                `Event ${event.id} failed validation: ${!result.success ? JSON.stringify(result.error.issues) : ''}`
            ).toBe(true);
        }
    });

    // ── Content Quality ─────────────────────────────────────────────

    it('all persons have non-empty names', () => {
        for (const p of seedPersons) {
            expect(p.canonicalName.trim().length).toBeGreaterThan(0);
        }
    });

    it('all persons have at least one occupation', () => {
        for (const p of seedPersons) {
            expect(p.occupations.length).toBeGreaterThan(0);
        }
    });

    it('Fuller is in the seed data', () => {
        const bucky = seedPersons.find(p => p.id === 'bucky-fuller');
        expect(bucky).toBeDefined();
        expect(bucky!.canonicalName).toContain('Fuller');
    });

    it('Fuller has the highest connectivity', () => {
        const degreeCounts = new Map<string, number>();
        for (const e of seedEdges) {
            degreeCounts.set(e.sourceId, (degreeCounts.get(e.sourceId) || 0) + 1);
            degreeCounts.set(e.targetId, (degreeCounts.get(e.targetId) || 0) + 1);
        }
        const fullerDegree = degreeCounts.get('bucky-fuller') || 0;
        for (const [id, degree] of degreeCounts) {
            if (id !== 'bucky-fuller') {
                expect(
                    fullerDegree >= degree,
                    `${id} has degree ${degree} > Fuller's ${fullerDegree}`
                ).toBe(true);
            }
        }
    });

    // ── Edge Type Consistency ───────────────────────────────────────

    it('all seed edge types are valid EdgeType enum values', () => {
        const validTypes = new Set(Object.values(EdgeType));
        for (const edge of seedEdges) {
            expect(
                validTypes.has(edge.edgeType as EdgeType),
                `Edge ${edge.id} has invalid edgeType "${edge.edgeType}"`
            ).toBe(true);
        }
    });

    it('all seed edge types have a category mapping', () => {
        for (const edge of seedEdges) {
            const category = EDGE_TYPE_TO_CATEGORY[edge.edgeType as EdgeType];
            expect(
                category,
                `Edge ${edge.id} type "${edge.edgeType}" has no category mapping`
            ).toBeDefined();
        }
    });

    it('no duplicate edges between same person pair with same type', () => {
        const seen = new Set<string>();
        for (const edge of seedEdges) {
            const key = `${edge.sourceId}|${edge.targetId}|${edge.edgeType}`;
            expect(
                !seen.has(key),
                `Duplicate edge: ${edge.sourceId} -> ${edge.targetId} (${edge.edgeType})`
            ).toBe(true);
            seen.add(key);
        }
    });

    it('all edge strengths are in [0, 1] when present', () => {
        for (const edge of seedEdges) {
            if (edge.strength !== undefined) {
                expect(edge.strength).toBeGreaterThanOrEqual(0);
                expect(edge.strength).toBeLessThanOrEqual(1);
            }
        }
    });

    it('all events have non-empty titles', () => {
        for (const event of seedEvents) {
            expect(
                event.title.trim().length,
                `Event ${event.id} has empty title`
            ).toBeGreaterThan(0);
        }
    });
});
