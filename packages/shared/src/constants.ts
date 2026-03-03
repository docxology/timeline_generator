// ─── Edge Type Taxonomy ─────────────────────────────────────────────
export enum EdgeType {
    KNEW_OF = 'KNEW_OF',
    READ_WORK_OF = 'READ_WORK_OF',
    CITED = 'CITED',
    INFLUENCED_BY = 'INFLUENCED_BY',
    CORRESPONDED_WITH = 'CORRESPONDED_WITH',
    MET_IN_PERSON = 'MET_IN_PERSON',
    COLLABORATED_WITH = 'COLLABORATED_WITH',
    MENTORED = 'MENTORED',
    MENTORED_BY = 'MENTORED_BY',
    TAUGHT = 'TAUGHT',
    STUDENT_OF = 'STUDENT_OF',
    PARENT_OF = 'PARENT_OF',
    CHILD_OF = 'CHILD_OF',
    SIBLING_OF = 'SIBLING_OF',
    SPOUSE_OF = 'SPOUSE_OF',
    RELATIVE_OF = 'RELATIVE_OF',
    PATRON_OF = 'PATRON_OF',
    FUNDED_BY = 'FUNDED_BY',
    EMPLOYED_BY = 'EMPLOYED_BY',
    EMPLOYER_OF = 'EMPLOYER_OF',
    CONTEMPORANEOUS_AT = 'CONTEMPORANEOUS_AT',
    OPPOSED = 'OPPOSED',
    INSPIRED_WORK = 'INSPIRED_WORK',
    CUSTOM = 'CUSTOM',
}

// ─── Edge Categories ────────────────────────────────────────────────
export enum EdgeCategory {
    EPISTEMIC = 'EPISTEMIC',
    INFLUENCE = 'INFLUENCE',
    CORRESPONDENCE = 'CORRESPONDENCE',
    COLLABORATION = 'COLLABORATION',
    PEDAGOGICAL = 'PEDAGOGICAL',
    FAMILY = 'FAMILY',
    INSTITUTIONAL = 'INSTITUTIONAL',
    SPATIAL = 'SPATIAL',
    CONFLICT = 'CONFLICT',
    CUSTOM = 'CUSTOM',
}

export const EDGE_TYPE_TO_CATEGORY: Record<EdgeType, EdgeCategory> = {
    [EdgeType.KNEW_OF]: EdgeCategory.EPISTEMIC,
    [EdgeType.READ_WORK_OF]: EdgeCategory.EPISTEMIC,
    [EdgeType.CITED]: EdgeCategory.EPISTEMIC,
    [EdgeType.INFLUENCED_BY]: EdgeCategory.INFLUENCE,
    [EdgeType.CORRESPONDED_WITH]: EdgeCategory.CORRESPONDENCE,
    [EdgeType.MET_IN_PERSON]: EdgeCategory.COLLABORATION,
    [EdgeType.COLLABORATED_WITH]: EdgeCategory.COLLABORATION,
    [EdgeType.MENTORED]: EdgeCategory.PEDAGOGICAL,
    [EdgeType.MENTORED_BY]: EdgeCategory.PEDAGOGICAL,
    [EdgeType.TAUGHT]: EdgeCategory.PEDAGOGICAL,
    [EdgeType.STUDENT_OF]: EdgeCategory.PEDAGOGICAL,
    [EdgeType.PARENT_OF]: EdgeCategory.FAMILY,
    [EdgeType.CHILD_OF]: EdgeCategory.FAMILY,
    [EdgeType.SIBLING_OF]: EdgeCategory.FAMILY,
    [EdgeType.SPOUSE_OF]: EdgeCategory.FAMILY,
    [EdgeType.RELATIVE_OF]: EdgeCategory.FAMILY,
    [EdgeType.PATRON_OF]: EdgeCategory.INSTITUTIONAL,
    [EdgeType.FUNDED_BY]: EdgeCategory.INSTITUTIONAL,
    [EdgeType.EMPLOYED_BY]: EdgeCategory.INSTITUTIONAL,
    [EdgeType.EMPLOYER_OF]: EdgeCategory.INSTITUTIONAL,
    [EdgeType.CONTEMPORANEOUS_AT]: EdgeCategory.SPATIAL,
    [EdgeType.OPPOSED]: EdgeCategory.CONFLICT,
    [EdgeType.INSPIRED_WORK]: EdgeCategory.INFLUENCE,
    [EdgeType.CUSTOM]: EdgeCategory.CUSTOM,
};

// ─── Edge Color Palette — Black/Gray/White/Red theme ────────────────
export const EDGE_CATEGORY_COLORS: Record<EdgeCategory, string> = {
    [EdgeCategory.EPISTEMIC]: '#a3a3a3',      // Gray 400
    [EdgeCategory.INFLUENCE]: '#DC2626',       // Red (accent)
    [EdgeCategory.CORRESPONDENCE]: '#78716c',  // Stone
    [EdgeCategory.COLLABORATION]: '#f5f5f5',   // White
    [EdgeCategory.PEDAGOGICAL]: '#EF4444',     // Red light
    [EdgeCategory.FAMILY]: '#B91C1C',          // Red dark
    [EdgeCategory.INSTITUTIONAL]: '#525252',   // Gray 600
    [EdgeCategory.SPATIAL]: '#737373',         // Gray 500
    [EdgeCategory.CONFLICT]: '#991B1B',        // Red 800
    [EdgeCategory.CUSTOM]: '#d4d4d4',          // Gray 300
};

// ─── Default Visibility ─────────────────────────────────────────────
export const DEFAULT_VISIBLE_CATEGORIES: Record<EdgeCategory, boolean> = {
    [EdgeCategory.EPISTEMIC]: true,
    [EdgeCategory.INFLUENCE]: true,
    [EdgeCategory.CORRESPONDENCE]: true,
    [EdgeCategory.COLLABORATION]: true,
    [EdgeCategory.PEDAGOGICAL]: true,
    [EdgeCategory.FAMILY]: false,
    [EdgeCategory.INSTITUTIONAL]: false,
    [EdgeCategory.SPATIAL]: false,
    [EdgeCategory.CONFLICT]: true,
    [EdgeCategory.CUSTOM]: true,
};

// ─── Event Types ────────────────────────────────────────────────────
export enum EventType {
    BIRTH = 'BIRTH',
    DEATH = 'DEATH',
    EDUCATION = 'EDUCATION',
    PUBLICATION = 'PUBLICATION',
    INVENTION = 'INVENTION',
    AWARD = 'AWARD',
    POSITION = 'POSITION',
    RESIDENCE = 'RESIDENCE',
    TRAVEL = 'TRAVEL',
    COLLABORATION = 'COLLABORATION',
    MILESTONE = 'MILESTONE',
    CUSTOM = 'CUSTOM',
}

// ─── Date Precision ─────────────────────────────────────────────────
export enum DatePrecision {
    YEAR = 'year',
    MONTH = 'month',
    DAY = 'day',
    APPROXIMATE = 'approximate',
}

// ─── Confidence Tiers (§6.3) ────────────────────────────────────────
export const CONFIDENCE_TIERS = [
    { min: 0.9, max: 1.0, label: 'Attested', description: 'Primary source documentation' },
    { min: 0.7, max: 0.9, label: 'High', description: 'Multiple secondary sources in agreement' },
    { min: 0.5, max: 0.7, label: 'Moderate', description: 'Single secondary source; Wikipedia with citation' },
    { min: 0.3, max: 0.5, label: 'Low', description: 'LLM inference; co-mention without documented interaction' },
    { min: 0.0, max: 0.3, label: 'Speculative', description: 'User hypothesis; no documentary evidence' },
] as const;

// ─── Domain Color Map — Black/Gray/White/Red theme ──────────────────
export const DOMAIN_COLORS: Record<string, string> = {
    'architecture': '#EF4444',
    'systems-theory': '#DC2626',
    'art': '#f87171',
    'music': '#B91C1C',
    'dance': '#fca5a5',
    'science': '#d4d4d4',
    'mathematics': '#a3a3a3',
    'philosophy': '#e5e5e5',
    'ecology': '#737373',
    'design': '#f5f5f5',
    'engineering': '#991B1B',
    'education': '#a3a3a3',
    'writing': '#525252',
    'journalism': '#d4d4d4',
    'family': '#fecaca',
    'policy': '#737373',
    'futurism': '#EF4444',
    'cybernetics': '#e5e5e5',
    'counterculture': '#DC2626',
    'default': '#a3a3a3',
};

// ─── Edge Direction ─────────────────────────────────────────────────
export enum EdgeDirection {
    DIRECTED = 'DIRECTED',
    BIDIRECTIONAL = 'BIDIRECTIONAL',
}

// ─── Layer Presets ───────────────────────────────────────────────────
export const LAYER_PRESETS: Record<string, EdgeCategory[]> = {
    'All': Object.values(EdgeCategory),
    'Intellectual': [EdgeCategory.EPISTEMIC, EdgeCategory.INFLUENCE, EdgeCategory.PEDAGOGICAL],
    'Social': [EdgeCategory.CORRESPONDENCE, EdgeCategory.COLLABORATION, EdgeCategory.SPATIAL],
    'Family': [EdgeCategory.FAMILY],
    'Institutional': [EdgeCategory.INSTITUTIONAL],
    'Conflicts': [EdgeCategory.CONFLICT],
};
