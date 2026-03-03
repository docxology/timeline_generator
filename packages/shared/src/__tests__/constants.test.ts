import { describe, it, expect } from 'vitest';
import {
    EdgeType,
    EdgeCategory,
    EDGE_TYPE_TO_CATEGORY,
    EDGE_CATEGORY_COLORS,
    DEFAULT_VISIBLE_CATEGORIES,
    EventType,
    DatePrecision,
    CONFIDENCE_TIERS,
    DOMAIN_COLORS,
    EdgeDirection,
    LAYER_PRESETS,
} from '../constants';

describe('EdgeType enum', () => {
    it('has 24 edge types', () => {
        expect(Object.keys(EdgeType)).toHaveLength(24);
    });

    it('every edge type maps to a category', () => {
        for (const type of Object.values(EdgeType)) {
            expect(EDGE_TYPE_TO_CATEGORY[type]).toBeDefined();
            expect(Object.values(EdgeCategory)).toContain(EDGE_TYPE_TO_CATEGORY[type]);
        }
    });

    it('includes all expected family types', () => {
        expect(EdgeType.PARENT_OF).toBe('PARENT_OF');
        expect(EdgeType.CHILD_OF).toBe('CHILD_OF');
        expect(EdgeType.SIBLING_OF).toBe('SIBLING_OF');
        expect(EdgeType.SPOUSE_OF).toBe('SPOUSE_OF');
        expect(EdgeType.RELATIVE_OF).toBe('RELATIVE_OF');
    });
});

describe('EdgeCategory enum', () => {
    it('has 10 categories', () => {
        expect(Object.keys(EdgeCategory)).toHaveLength(10);
    });

    it('every category has a color', () => {
        for (const cat of Object.values(EdgeCategory)) {
            expect(EDGE_CATEGORY_COLORS[cat]).toBeDefined();
            expect(EDGE_CATEGORY_COLORS[cat]).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });

    it('every category has a default visibility', () => {
        for (const cat of Object.values(EdgeCategory)) {
            expect(typeof DEFAULT_VISIBLE_CATEGORIES[cat]).toBe('boolean');
        }
    });
});

describe('EDGE_TYPE_TO_CATEGORY mapping', () => {
    it('maps epistemic types correctly', () => {
        expect(EDGE_TYPE_TO_CATEGORY[EdgeType.KNEW_OF]).toBe(EdgeCategory.EPISTEMIC);
        expect(EDGE_TYPE_TO_CATEGORY[EdgeType.READ_WORK_OF]).toBe(EdgeCategory.EPISTEMIC);
        expect(EDGE_TYPE_TO_CATEGORY[EdgeType.CITED]).toBe(EdgeCategory.EPISTEMIC);
    });

    it('maps family types correctly', () => {
        expect(EDGE_TYPE_TO_CATEGORY[EdgeType.PARENT_OF]).toBe(EdgeCategory.FAMILY);
        expect(EDGE_TYPE_TO_CATEGORY[EdgeType.SPOUSE_OF]).toBe(EdgeCategory.FAMILY);
    });

    it('maps pedagogical types correctly', () => {
        expect(EDGE_TYPE_TO_CATEGORY[EdgeType.MENTORED]).toBe(EdgeCategory.PEDAGOGICAL);
        expect(EDGE_TYPE_TO_CATEGORY[EdgeType.STUDENT_OF]).toBe(EdgeCategory.PEDAGOGICAL);
    });
});

describe('EventType enum', () => {
    it('has 12 event types', () => {
        expect(Object.keys(EventType)).toHaveLength(12);
    });

    it('includes core lifecycle events', () => {
        expect(EventType.BIRTH).toBe('BIRTH');
        expect(EventType.DEATH).toBe('DEATH');
        expect(EventType.EDUCATION).toBe('EDUCATION');
        expect(EventType.PUBLICATION).toBe('PUBLICATION');
    });
});

describe('DatePrecision enum', () => {
    it('has 4 precision levels', () => {
        expect(Object.keys(DatePrecision)).toHaveLength(4);
    });

    it('includes expected levels', () => {
        expect(DatePrecision.YEAR).toBe('year');
        expect(DatePrecision.MONTH).toBe('month');
        expect(DatePrecision.DAY).toBe('day');
        expect(DatePrecision.APPROXIMATE).toBe('approximate');
    });
});

describe('CONFIDENCE_TIERS', () => {
    it('has 5 tiers', () => {
        expect(CONFIDENCE_TIERS).toHaveLength(5);
    });

    it('covers the full 0.0–1.0 range without gaps', () => {
        const sorted = [...CONFIDENCE_TIERS].sort((a, b) => a.min - b.min);
        expect(sorted[0].min).toBe(0.0);
        expect(sorted[sorted.length - 1].max).toBe(1.0);
        for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].min).toBeCloseTo(sorted[i - 1].max, 10);
        }
    });

    it('each tier has a label and description', () => {
        for (const tier of CONFIDENCE_TIERS) {
            expect(tier.label).toBeTruthy();
            expect(tier.description).toBeTruthy();
        }
    });
});

describe('DOMAIN_COLORS', () => {
    it('has at least 15 domains', () => {
        expect(Object.keys(DOMAIN_COLORS).length).toBeGreaterThanOrEqual(15);
    });

    it('includes a default color', () => {
        expect(DOMAIN_COLORS['default']).toBeDefined();
    });

    it('all colors are valid hex', () => {
        for (const color of Object.values(DOMAIN_COLORS)) {
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });

    it('includes architecture and science domains', () => {
        expect(DOMAIN_COLORS['architecture']).toBeDefined();
        expect(DOMAIN_COLORS['science']).toBeDefined();
    });
});

describe('EdgeDirection enum', () => {
    it('has DIRECTED and BIDIRECTIONAL', () => {
        expect(EdgeDirection.DIRECTED).toBe('DIRECTED');
        expect(EdgeDirection.BIDIRECTIONAL).toBe('BIDIRECTIONAL');
    });
});

describe('LAYER_PRESETS', () => {
    it('has at least 5 presets', () => {
        expect(Object.keys(LAYER_PRESETS).length).toBeGreaterThanOrEqual(5);
    });

    it('"All" preset contains every category', () => {
        const allCategories = Object.values(EdgeCategory);
        expect(LAYER_PRESETS['All']).toEqual(allCategories);
    });

    it('"Family" preset contains only FAMILY', () => {
        expect(LAYER_PRESETS['Family']).toEqual([EdgeCategory.FAMILY]);
    });

    it('all preset categories are valid EdgeCategory values', () => {
        const validCategories = Object.values(EdgeCategory);
        for (const cats of Object.values(LAYER_PRESETS)) {
            for (const cat of cats) {
                expect(validCategories).toContain(cat);
            }
        }
    });
});
