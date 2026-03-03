import { describe, it, expect } from 'vitest';
import {
    PersonSchema,
    EdgeSchema,
    TemporalEventSchema,
    FocalGraphSchema,
    CreatePersonSchema,
    UpdatePersonSchema,
    CreateEdgeSchema,
    CreateEventSchema,
    PlaceSchema,
    SourceSchema,
} from '../schemas';
import { EdgeType, EdgeDirection, EventType, DatePrecision } from '../constants';

// ── Valid Test Data ──────────────────────────────────────────────────

const validPerson = {
    id: 'test-person-1',
    canonicalName: 'Test Person',
    occupations: [{ name: 'Engineer', domain: 'engineering' }],
    confidence: 0.85,
};

const fullPerson = {
    ...validPerson,
    alternateNames: ['Testy', 'T.P.'],
    birthDate: '1940-05-15',
    birthDatePrecision: DatePrecision.DAY,
    birthPlace: { city: 'Boston', region: 'MA', country: 'US', lat: 42.36, lng: -71.06 },
    deathDate: '2020-12-01',
    deathDatePrecision: DatePrecision.DAY,
    gender: 'male',
    nationalities: [{ name: 'American', start: '1940', end: '2020' }],
    affiliations: [{ name: 'MIT', role: 'Professor', start: '1970', end: '1990' }],
    bioSummary: 'A test person.',
    bioLong: 'A longer biography about the test person.',
    imageUrl: 'https://example.com/photo.jpg',
    wikidataId: 'Q12345',
    wikipediaSlug: 'Test_Person',
    provenance: [{ id: 'src-1', url: 'https://example.com', title: 'Source' }],
    tags: ['test', 'example'],
    primaryDomain: 'engineering',
    customFields: { specialty: 'bridges' },
};

const validEdge = {
    id: 'edge-1',
    sourceId: 'person-a',
    targetId: 'person-b',
    edgeType: EdgeType.COLLABORATED_WITH,
    direction: EdgeDirection.BIDIRECTIONAL,
    confidence: 0.9,
};

const fullEdge = {
    ...validEdge,
    customLabel: 'Worked together on Project X',
    startDate: '1960',
    endDate: '1975',
    strength: 0.8,
    description: 'They collaborated on a major work.',
    evidence: [{ id: 'src-1', title: 'Biography' }],
    tags: ['collaboration'],
    colorOverride: '#FF5733',
    weightOverride: 2.0,
};

const validEvent = {
    id: 'event-1',
    personId: 'person-a',
    type: EventType.BIRTH,
    title: 'Born in Boston',
    date: '1940-05-15',
};

// ── Schema Tests ────────────────────────────────────────────────────

describe('PlaceSchema', () => {
    it('validates an empty place', () => {
        expect(PlaceSchema.safeParse({}).success).toBe(true);
    });

    it('validates a full place', () => {
        const result = PlaceSchema.safeParse({ city: 'Boston', region: 'MA', country: 'US', lat: 42.36, lng: -71.06 });
        expect(result.success).toBe(true);
    });

    it('rejects non-numeric lat/lng', () => {
        expect(PlaceSchema.safeParse({ lat: 'north' }).success).toBe(false);
    });
});

describe('SourceSchema', () => {
    it('validates a minimal source', () => {
        expect(SourceSchema.safeParse({ id: 'src-1' }).success).toBe(true);
    });

    it('validates a full source', () => {
        const result = SourceSchema.safeParse({
            id: 'src-1', url: 'https://example.com', title: 'Source Title',
            quote: 'A quote', accessDate: '2026-01-01', contributor: 'Researcher',
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing id', () => {
        expect(SourceSchema.safeParse({ url: 'https://example.com' }).success).toBe(false);
    });
});

describe('PersonSchema', () => {
    it('validates a minimal person', () => {
        const result = PersonSchema.safeParse(validPerson);
        expect(result.success).toBe(true);
    });

    it('validates a fully populated person', () => {
        const result = PersonSchema.safeParse(fullPerson);
        expect(result.success).toBe(true);
    });

    it('rejects missing canonicalName', () => {
        const result = PersonSchema.safeParse({ id: 'x', occupations: [], confidence: 0.5 });
        expect(result.success).toBe(false);
    });

    it('rejects missing occupations', () => {
        const result = PersonSchema.safeParse({ id: 'x', canonicalName: 'Test', confidence: 0.5 });
        expect(result.success).toBe(false);
    });

    it('rejects confidence > 1.0', () => {
        const result = PersonSchema.safeParse({ ...validPerson, confidence: 1.5 });
        expect(result.success).toBe(false);
    });

    it('rejects confidence < 0.0', () => {
        const result = PersonSchema.safeParse({ ...validPerson, confidence: -0.1 });
        expect(result.success).toBe(false);
    });

    it('rejects non-string birthDate', () => {
        const result = PersonSchema.safeParse({ ...validPerson, birthDate: 1940 });
        expect(result.success).toBe(false);
    });
});

describe('EdgeSchema', () => {
    it('validates a minimal edge', () => {
        expect(EdgeSchema.safeParse(validEdge).success).toBe(true);
    });

    it('validates a full edge', () => {
        expect(EdgeSchema.safeParse(fullEdge).success).toBe(true);
    });

    it('rejects missing edgeType', () => {
        const { edgeType, ...rest } = validEdge;
        expect(EdgeSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects invalid edgeType', () => {
        expect(EdgeSchema.safeParse({ ...validEdge, edgeType: 'MADE_UP' }).success).toBe(false);
    });

    it('rejects strength > 1.0', () => {
        expect(EdgeSchema.safeParse({ ...validEdge, strength: 2.0 }).success).toBe(false);
    });

    it('rejects confidence < 0', () => {
        expect(EdgeSchema.safeParse({ ...validEdge, confidence: -0.1 }).success).toBe(false);
    });
});

describe('TemporalEventSchema', () => {
    it('validates a minimal event', () => {
        expect(TemporalEventSchema.safeParse(validEvent).success).toBe(true);
    });

    it('validates a full event', () => {
        const result = TemporalEventSchema.safeParse({
            ...validEvent,
            description: 'Full description',
            datePrecision: DatePrecision.DAY,
            endDate: '1940-05-15',
            place: { city: 'Boston' },
            confidence: 0.95,
            provenance: [{ id: 'src-1' }],
            tags: ['birth'],
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing title', () => {
        const { title, ...rest } = validEvent;
        expect(TemporalEventSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects invalid event type', () => {
        expect(TemporalEventSchema.safeParse({ ...validEvent, type: 'INVENTED' }).success).toBe(false);
    });
});

describe('FocalGraphSchema', () => {
    it('validates a minimal focal graph', () => {
        const result = FocalGraphSchema.safeParse({
            id: 'graph-1',
            name: 'Fuller Network',
            personIds: ['p1', 'p2'],
            edgeIds: ['e1'],
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        });
        expect(result.success).toBe(true);
    });

    it('validates with layout mode', () => {
        const result = FocalGraphSchema.safeParse({
            id: 'graph-1',
            name: 'Test',
            personIds: [],
            edgeIds: [],
            layoutMode: 'force',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid layout mode', () => {
        const result = FocalGraphSchema.safeParse({
            id: 'graph-1',
            name: 'Test',
            personIds: [],
            edgeIds: [],
            layoutMode: 'scattered',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        });
        expect(result.success).toBe(false);
    });
});

describe('Create/Update variants', () => {
    it('CreatePersonSchema omits id', () => {
        const { id, ...rest } = validPerson;
        expect(CreatePersonSchema.safeParse(rest).success).toBe(true);
        expect(CreatePersonSchema.safeParse(validPerson).success).toBe(true); // id is just stripped
    });

    it('UpdatePersonSchema allows partial data', () => {
        expect(UpdatePersonSchema.safeParse({ canonicalName: 'Updated Name' }).success).toBe(true);
        expect(UpdatePersonSchema.safeParse({}).success).toBe(true);
    });

    it('CreateEdgeSchema omits id', () => {
        const { id, ...rest } = validEdge;
        expect(CreateEdgeSchema.safeParse(rest).success).toBe(true);
    });

    it('CreateEventSchema omits id', () => {
        const { id, ...rest } = validEvent;
        expect(CreateEventSchema.safeParse(rest).success).toBe(true);
    });
});
