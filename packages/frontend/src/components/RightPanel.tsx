/**
 * @module RightPanel
 * @description Right sidebar showing detailed views for selected persons or edges.
 * Displays biography, occupations, affiliations, events timeline, relationships,
 * tags, external links, and confidence metrics.
 * Wrapped in an ErrorBoundary to prevent crashes from incomplete person data.
 */

import React, { useEffect, useState, Component } from 'react';
import type { TemporalEvent } from 'shared';
import { EDGE_TYPE_TO_CATEGORY, EDGE_CATEGORY_COLORS, DOMAIN_COLORS, CONFIDENCE_TIERS } from 'shared';
import { useGraphStore } from '../store/graphStore';
import { api } from '../api/client';

/** Error boundary to catch render errors in the RightPanel. */
class RightPanelErrorBoundary extends Component<
    { children: React.ReactNode },
    { hasError: boolean; error: string }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: '' };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message };
    }
    componentDidCatch(err: Error) {
        console.error('[RightPanel] Render error:', err);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center space-y-3">
                        <div className="text-3xl">⚠️</div>
                        <h3 className="text-sm font-semibold text-surface-400">Display Error</h3>
                        <p className="text-xs text-surface-500 max-w-[200px]">{this.state.error}</p>
                        <button
                            className="text-xs text-accent hover:underline"
                            onClick={() => this.setState({ hasError: false, error: '' })}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Right panel with person detail, edge inspector, or empty state.
 * Auto-fetches events from the API when a person is selected.
 * All interactive elements (close, navigate, external links) are keyboard-accessible.
 */
function RightPanelInner() {
    const selectedPersonId = useGraphStore(s => s.selectedPersonId);
    const selectedEdgeId = useGraphStore(s => s.selectedEdgeId);
    const persons = useGraphStore(s => s.persons);
    const edges = useGraphStore(s => s.edges);
    const selectPerson = useGraphStore(s => s.selectPerson);
    const selectEdge = useGraphStore(s => s.selectEdge);
    const setPersons = useGraphStore(s => s.setPersons);
    const setEdges = useGraphStore(s => s.setEdges);

    const [events, setEvents] = useState<TemporalEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [enriching, setEnriching] = useState(false);

    const selectedPerson = persons.find(p => p.id === selectedPersonId);
    const selectedEdge = edges.find(e => e.id === selectedEdgeId);

    // Fetch events when person is selected
    useEffect(() => {
        if (!selectedPersonId) {
            setEvents([]);
            return;
        }
        setLoadingEvents(true);
        api.getPersonEvents(selectedPersonId)
            .then(res => setEvents(res.data || []))
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));
    }, [selectedPersonId]);

    const handleEnrich = async () => {
        if (!selectedPersonId) return;
        setEnriching(true);
        try {
            await api.enrichPerson(selectedPersonId);
            const graphData = await api.getFullGraph();
            setPersons(graphData.nodes || []);
            setEdges(graphData.links || []);
        } catch (err) {
            console.error('Enrichment failed', err);
        } finally {
            setEnriching(false);
        }
    };

    const personEdges = selectedPersonId
        ? edges.filter(e => e.sourceId === selectedPersonId || e.targetId === selectedPersonId)
        : [];

    const getConfidenceTier = (confidence: number) => {
        return CONFIDENCE_TIERS.find(t => confidence >= t.min && confidence <= t.max) || CONFIDENCE_TIERS[CONFIDENCE_TIERS.length - 1];
    };

    // ── Edge Inspector View ──────────────────────────────────────────
    if (selectedEdge) {
        const source = persons.find(p => p.id === selectedEdge.sourceId);
        const target = persons.find(p => p.id === selectedEdge.targetId);
        const category = EDGE_TYPE_TO_CATEGORY[selectedEdge.edgeType];
        const color = selectedEdge.colorOverride || EDGE_CATEGORY_COLORS[category];
        const tier = getConfidenceTier(selectedEdge.confidence);

        return (
            <div className="h-full flex flex-col animate-fade-in">
                <div className="p-4 border-b border-surface-700/30 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-surface-200">Edge Inspector</h2>
                    <button onClick={() => selectEdge(null)} className="btn-ghost text-xs" aria-label="Close edge inspector">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                    {/* Edge type badge */}
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="badge text-white" style={{ backgroundColor: color + '33', borderColor: color, border: '1px solid' }}>
                            {selectedEdge.edgeType.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Source → Target */}
                    <div className="flex items-center gap-2 text-sm">
                        <button onClick={() => source && selectPerson(source.id)} className="text-accent hover:underline font-medium">
                            {source?.canonicalName || selectedEdge.sourceId}
                        </button>
                        <span className="text-surface-500">→</span>
                        <button onClick={() => target && selectPerson(target.id)} className="text-accent hover:underline font-medium">
                            {target?.canonicalName || selectedEdge.targetId}
                        </button>
                    </div>

                    {/* Description */}
                    {selectedEdge.description && (
                        <p className="text-sm text-surface-300 leading-relaxed">{selectedEdge.description}</p>
                    )}

                    {/* Dates */}
                    {(selectedEdge.startDate || selectedEdge.endDate) && (
                        <div className="text-xs text-surface-400 font-mono">
                            {(() => {
                                const start = selectedEdge.startDate?.substring(0, 4) || '?';
                                const end = selectedEdge.endDate?.substring(0, 4) || 'ongoing';
                                return start === end ? start : `${start} – ${end}`;
                            })()}
                        </div>
                    )}

                    {/* Confidence */}
                    <div>
                        <div className="flex justify-between text-xs text-surface-400 mb-1">
                            <span>Confidence</span>
                            <span className="font-mono">{(selectedEdge.confidence * 100).toFixed(0)}% — {tier.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
                            <div className="confidence-bar bg-accent" style={{ width: `${selectedEdge.confidence * 100}%` }} />
                        </div>
                    </div>

                    {/* Strength */}
                    {selectedEdge.strength !== undefined && (
                        <div>
                            <div className="flex justify-between text-xs text-surface-400 mb-1">
                                <span>Strength</span>
                                <span className="font-mono">{(selectedEdge.strength * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
                                <div className="confidence-bar" style={{ width: `${selectedEdge.strength * 100}%`, backgroundColor: color }} />
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {selectedEdge.tags && selectedEdge.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {selectedEdge.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-800/50 text-surface-400">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Person Detail View ───────────────────────────────────────────
    if (selectedPerson) {
        const confidence = selectedPerson.confidence ?? 0;
        const tier = getConfidenceTier(confidence);
        return (
            <div className="h-full flex flex-col animate-slide-in">
                <div className="p-4 border-b border-surface-700/30 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-surface-200">Person Detail</h2>
                    <button onClick={() => selectPerson(null)} className="btn-ghost text-xs" aria-label="Close person detail">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                            style={{ backgroundColor: DOMAIN_COLORS[selectedPerson.primaryDomain || 'default'] || DOMAIN_COLORS.default }}
                        >
                            {selectedPerson.canonicalName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-surface-100">{selectedPerson.canonicalName}</h3>
                            {selectedPerson.alternateNames && selectedPerson.alternateNames.length > 0 && (
                                <p className="text-[10px] text-surface-500 italic">{selectedPerson.alternateNames.join(', ')}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono text-surface-400">
                                    {(() => {
                                        const birth = selectedPerson.birthDate?.substring(0, 4) || '?';
                                        const death = selectedPerson.deathDate?.substring(0, 4);
                                        if (!death) return `${birth} – present`;
                                        if (birth === death) return birth;
                                        return `${birth} – ${death}`;
                                    })()}
                                </span>
                                {selectedPerson.primaryDomain && (
                                    <span
                                        className="badge text-white text-[10px]"
                                        style={{ backgroundColor: (DOMAIN_COLORS[selectedPerson.primaryDomain] || DOMAIN_COLORS.default) + 'CC' }}
                                    >
                                        {selectedPerson.primaryDomain}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleEnrich}
                            disabled={enriching}
                            className="flex-1 btn-primary py-2 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Research and add missing facts, connections, and dates using AI"
                        >
                            {enriching ? (
                                <>
                                    <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Enriching…
                                </>
                            ) : (
                                <>
                                    ✨ Enrich Profile
                                </>
                            )}
                        </button>
                    </div>

                    {/* Confidence */}
                    <div>
                        <div className="flex justify-between text-xs text-surface-400 mb-1">
                            <span>Record Confidence</span>
                            <span className="font-mono">{(confidence * 100).toFixed(0)}% — {tier.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
                            <div className="confidence-bar bg-accent" style={{ width: `${confidence * 100}%` }} />
                        </div>
                    </div>

                    {/* Bio */}
                    {selectedPerson.bioSummary && (
                        <div>
                            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Biography</h4>
                            <p className="text-sm text-surface-300 leading-relaxed">{selectedPerson.bioSummary}</p>
                        </div>
                    )}

                    {/* Occupations */}
                    {(selectedPerson.occupations || []).length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Occupations</h4>
                            <div className="flex flex-wrap gap-1">
                                {(selectedPerson.occupations || []).map((occ, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800/50 text-surface-300 border border-surface-700/30">
                                        {occ.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Affiliations */}
                    {selectedPerson.affiliations && selectedPerson.affiliations.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Affiliations</h4>
                            <div className="space-y-1">
                                {selectedPerson.affiliations.map((aff, i) => (
                                    <div key={i} className="text-xs text-surface-300">
                                        <span className="font-medium">{aff.name}</span>
                                        {aff.role && <span className="text-surface-500"> — {aff.role}</span>}
                                        {(aff.start || aff.end) && (
                                            <span className="text-surface-500 font-mono ml-1">
                                                ({aff.start || '?'}–{aff.end || 'present'})
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Events */}
                    <div>
                        <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                            Events Timeline {loadingEvents && <span className="animate-pulse">...</span>}
                        </h4>
                        <div className="space-y-1.5">
                            {events.map(ev => (
                                <div key={ev.id} className="flex items-start gap-2 text-xs">
                                    <span className="font-mono text-surface-500 flex-shrink-0 w-10 text-right">{ev.date?.substring(0, 4) || '?'}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1 flex-shrink-0" />
                                    <div>
                                        <span className="text-surface-300">{ev.title}</span>
                                        {ev.description && <p className="text-surface-500 mt-0.5">{ev.description}</p>}
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && !loadingEvents && (
                                <p className="text-xs text-surface-500 italic">No events recorded</p>
                            )}
                        </div>
                    </div>

                    {/* Relationships */}
                    <div>
                        <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                            Relationships ({personEdges.length})
                        </h4>
                        <div className="space-y-1">
                            {personEdges.map(edge => {
                                const otherId = edge.sourceId === selectedPerson.id ? edge.targetId : edge.sourceId;
                                const other = persons.find(p => p.id === otherId);
                                const cat = EDGE_TYPE_TO_CATEGORY[edge.edgeType];
                                const color = edge.colorOverride || EDGE_CATEGORY_COLORS[cat];
                                return (
                                    <button
                                        key={edge.id}
                                        onClick={() => selectEdge(edge.id)}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-surface-800/50 transition-colors"
                                    >
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                        <span className="text-xs text-surface-300 truncate flex-1">
                                            {edge.edgeType.replace(/_/g, ' ').toLowerCase()} — {other?.canonicalName || otherId}
                                        </span>
                                        <span className="text-[9px] text-surface-500 font-mono">{(edge.confidence * 100).toFixed(0)}%</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tags */}
                    {selectedPerson.tags && selectedPerson.tags.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Tags</h4>
                            <div className="flex flex-wrap gap-1">
                                {selectedPerson.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800/50 text-surface-400">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* External Links */}
                    <div className="flex gap-2 pt-2 border-t border-surface-700/30">
                        {selectedPerson.wikipediaSlug && (
                            <a
                                href={`https://en.wikipedia.org/wiki/${selectedPerson.wikipediaSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent hover:underline"
                            >
                                Wikipedia ↗
                            </a>
                        )}
                        {selectedPerson.wikidataId && (
                            <a
                                href={`https://www.wikidata.org/wiki/${selectedPerson.wikidataId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent hover:underline"
                            >
                                Wikidata ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── Empty state ──────────────────────────────────────────────────
    return (
        <div className="h-full flex items-center justify-center p-6">
            <div className="text-center space-y-3">
                <div className="text-4xl">🌐</div>
                <h3 className="text-sm font-semibold text-surface-400">Select a node or edge</h3>
                <p className="text-xs text-surface-500 max-w-[200px]">
                    Click on a person node in the graph or a lifespan bar in the timeline to view their details and relationships.
                </p>
            </div>
        </div>
    );
}

/** Wrapped export with error boundary for resilience. */
export default function RightPanelWithBoundary() {
    return (
        <RightPanelErrorBoundary>
            <RightPanelInner />
        </RightPanelErrorBoundary>
    );
}
