/**
 * @module LayerPanel
 * @description Edge category filtering controls with preset layer groups
 * and a confidence floor slider. Controls which relationship types are
 * visible in the graph visualization.
 */

import React from 'react';
import { EdgeCategory, EDGE_CATEGORY_COLORS, EDGE_TYPE_TO_CATEGORY, LAYER_PRESETS } from 'shared';
import { useGraphStore } from '../store/graphStore';

const CATEGORY_LABELS: Record<EdgeCategory, string> = {
    [EdgeCategory.EPISTEMIC]: 'Epistemic (knew of, cited, read)',
    [EdgeCategory.INFLUENCE]: 'Influence',
    [EdgeCategory.CORRESPONDENCE]: 'Correspondence',
    [EdgeCategory.COLLABORATION]: 'Collaboration',
    [EdgeCategory.PEDAGOGICAL]: 'Pedagogical (mentor/student)',
    [EdgeCategory.FAMILY]: 'Family / Genealogical',
    [EdgeCategory.INSTITUTIONAL]: 'Institutional',
    [EdgeCategory.SPATIAL]: 'Spatial / Contemporaneous',
    [EdgeCategory.CONFLICT]: 'Conflict / Opposition',
    [EdgeCategory.CUSTOM]: 'Custom',
};

const CATEGORY_GROUPS: Array<{ label: string; categories: EdgeCategory[] }> = [
    {
        label: 'Intellectual',
        categories: [EdgeCategory.EPISTEMIC, EdgeCategory.INFLUENCE, EdgeCategory.PEDAGOGICAL],
    },
    {
        label: 'Social',
        categories: [EdgeCategory.CORRESPONDENCE, EdgeCategory.COLLABORATION, EdgeCategory.SPATIAL],
    },
    {
        label: 'Personal',
        categories: [EdgeCategory.FAMILY, EdgeCategory.INSTITUTIONAL, EdgeCategory.CONFLICT, EdgeCategory.CUSTOM],
    },
];

export default function LayerPanel() {
    const visibleCategories = useGraphStore(s => s.visibleCategories);
    const toggleCategory = useGraphStore(s => s.toggleCategory);
    const setVisibleCategories = useGraphStore(s => s.setVisibleCategories);
    const confidenceFloor = useGraphStore(s => s.confidenceFloor);
    const setConfidenceFloor = useGraphStore(s => s.setConfidenceFloor);
    const edges = useGraphStore(s => s.edges);

    const handlePreset = (presetName: string) => {
        const presetCats = LAYER_PRESETS[presetName];
        const newVisible = Object.fromEntries(
            Object.values(EdgeCategory).map(cat => [cat, presetCats.includes(cat)])
        ) as Record<EdgeCategory, boolean>;
        setVisibleCategories(newVisible);
    };

    return (
        <div className="space-y-4">
            {/* Presets */}
            <div>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Layer Presets</h4>
                <div className="flex flex-wrap gap-1.5">
                    {Object.keys(LAYER_PRESETS).map(name => (
                        <button
                            key={name}
                            onClick={() => handlePreset(name)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface-800/60 text-surface-300 hover:bg-surface-700/80 hover:text-surface-100 transition-all duration-200 border border-surface-700/30"
                            title={`Show ${name.toLowerCase()} relationships`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category groups */}
            {CATEGORY_GROUPS.map(group => (
                <div key={group.label}>
                    <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">{group.label}</h4>
                    <div className="space-y-1">
                        {group.categories.map(cat => {
                            const count = edges.filter(e => EDGE_TYPE_TO_CATEGORY[e.edgeType] === cat).length;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    aria-pressed={visibleCategories[cat]}
                                    aria-label={`Toggle ${CATEGORY_LABELS[cat]} visibility`}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-200 ${visibleCategories[cat]
                                        ? 'bg-surface-800/40 text-surface-200'
                                        : 'text-surface-500 hover:text-surface-400 opacity-50'
                                        }`}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0 transition-opacity duration-200"
                                        style={{
                                            backgroundColor: EDGE_CATEGORY_COLORS[cat],
                                            opacity: visibleCategories[cat] ? 1 : 0.3,
                                        }}
                                    />
                                    <span className="text-xs flex-1 truncate">{CATEGORY_LABELS[cat]}</span>
                                    <span className="text-xs text-surface-500 font-mono">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Confidence floor slider */}
            <div>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                    Confidence Floor: <span className="text-accent font-mono">{confidenceFloor.toFixed(1)}</span>
                </h4>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={confidenceFloor}
                    onChange={e => setConfidenceFloor(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-accent"
                    aria-label={`Confidence floor: ${confidenceFloor.toFixed(1)}`}
                    title={`Confidence floor: ${confidenceFloor.toFixed(1)}`}
                />
                <div className="flex justify-between text-[9px] text-surface-500 mt-1">
                    <span>Speculative</span>
                    <span>Attested</span>
                </div>
            </div>
        </div>
    );
}
