/**
 * @file exports.test.ts
 * @description Barrel export tests ensuring the shared package's public API
 * is complete and stable. Verifies all types, schemas, constants, and enums
 * are accessible through the package's index.ts barrel.
 */

import { describe, it, expect } from 'vitest';
import * as shared from '../index';

describe('Shared Package Exports', () => {
    describe('Type Exports', () => {
        it('exports all primary entity type names', () => {
            // Types themselves are erased at runtime, but schemas serve as proxies
            expect(shared.PersonSchema).toBeDefined();
            expect(shared.EdgeSchema).toBeDefined();
            expect(shared.TemporalEventSchema).toBeDefined();
            expect(shared.PlaceSchema).toBeDefined();
            expect(shared.SourceSchema).toBeDefined();
            expect(shared.FocalGraphSchema).toBeDefined();
        });
    });

    describe('Schema Exports', () => {
        it('exports create/update variant schemas', () => {
            expect(shared.CreatePersonSchema).toBeDefined();
            expect(shared.UpdatePersonSchema).toBeDefined();
            expect(shared.CreateEdgeSchema).toBeDefined();
            expect(shared.UpdateEdgeSchema).toBeDefined();
            expect(shared.CreateEventSchema).toBeDefined();
        });

        it('schemas have parse method', () => {
            expect(typeof shared.PersonSchema.parse).toBe('function');
            expect(typeof shared.EdgeSchema.parse).toBe('function');
            expect(typeof shared.TemporalEventSchema.parse).toBe('function');
        });

        it('schemas have safeParse method', () => {
            expect(typeof shared.PersonSchema.safeParse).toBe('function');
            expect(typeof shared.EdgeSchema.safeParse).toBe('function');
            expect(typeof shared.TemporalEventSchema.safeParse).toBe('function');
        });
    });

    describe('Enum Exports', () => {
        it('exports EdgeType enum', () => {
            expect(shared.EdgeType).toBeDefined();
            expect(shared.EdgeType.KNEW_OF).toBe('KNEW_OF');
            expect(shared.EdgeType.COLLABORATED_WITH).toBe('COLLABORATED_WITH');
        });

        it('exports EdgeCategory enum', () => {
            expect(shared.EdgeCategory).toBeDefined();
            expect(shared.EdgeCategory.EPISTEMIC).toBe('EPISTEMIC');
        });

        it('exports EdgeDirection enum', () => {
            expect(shared.EdgeDirection).toBeDefined();
            expect(shared.EdgeDirection.DIRECTED).toBe('DIRECTED');
            expect(shared.EdgeDirection.BIDIRECTIONAL).toBe('BIDIRECTIONAL');
        });

        it('exports EventType enum', () => {
            expect(shared.EventType).toBeDefined();
            expect(shared.EventType.BIRTH).toBe('BIRTH');
            expect(shared.EventType.DEATH).toBe('DEATH');
        });

        it('exports DatePrecision enum', () => {
            expect(shared.DatePrecision).toBeDefined();
            expect(shared.DatePrecision.YEAR).toBe('year');
            expect(shared.DatePrecision.DAY).toBe('day');
        });
    });

    describe('Constant Exports', () => {
        it('exports EDGE_TYPE_TO_CATEGORY mapping', () => {
            expect(shared.EDGE_TYPE_TO_CATEGORY).toBeDefined();
            expect(shared.EDGE_TYPE_TO_CATEGORY[shared.EdgeType.KNEW_OF]).toBe(shared.EdgeCategory.EPISTEMIC);
        });

        it('exports EDGE_CATEGORY_COLORS', () => {
            expect(shared.EDGE_CATEGORY_COLORS).toBeDefined();
            expect(typeof shared.EDGE_CATEGORY_COLORS[shared.EdgeCategory.EPISTEMIC]).toBe('string');
        });

        it('exports DEFAULT_VISIBLE_CATEGORIES', () => {
            expect(shared.DEFAULT_VISIBLE_CATEGORIES).toBeDefined();
            expect(typeof shared.DEFAULT_VISIBLE_CATEGORIES[shared.EdgeCategory.EPISTEMIC]).toBe('boolean');
        });

        it('exports CONFIDENCE_TIERS', () => {
            expect(shared.CONFIDENCE_TIERS).toBeDefined();
            expect(shared.CONFIDENCE_TIERS.length).toBe(5);
        });

        it('exports DOMAIN_COLORS', () => {
            expect(shared.DOMAIN_COLORS).toBeDefined();
            expect(shared.DOMAIN_COLORS['default']).toBeDefined();
        });

        it('exports LAYER_PRESETS', () => {
            expect(shared.LAYER_PRESETS).toBeDefined();
            expect(shared.LAYER_PRESETS['All']).toBeDefined();
            expect(Array.isArray(shared.LAYER_PRESETS['Intellectual'])).toBe(true);
        });
    });

    describe('Export Completeness', () => {
        it('has at least 20 named exports', () => {
            const exportCount = Object.keys(shared).length;
            expect(exportCount).toBeGreaterThanOrEqual(20);
        });

        it('has no undefined exports', () => {
            Object.entries(shared).forEach(([key, value]) => {
                expect(value).toBeDefined();
            });
        });
    });
});
