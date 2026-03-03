/**
 * @module ResearchPanel
 * @description Modal overlay for Perplexity AI-powered biographical research.
 * Allows users to search for historical figures, view structured results
 * (biography, connections, timeline events, citations), and add results
 * to the knowledge graph.
 *
 * Keyboard shortcuts:
 * - Enter: Submit search query
 * - Escape: Close modal
 *
 * Accessibility:
 * - Modal has role="dialog" with aria-modal and aria-labelledby
 * - Focus is auto-set to search input on open
 * - Close button has aria-label
 * - All interactive elements have focus indicators
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useGraphStore } from '../store/graphStore';

/** Shape of a Perplexity research API response. */
interface ResearchResult {
    person?: {
        canonicalName: string;
        birthDate?: string;
        deathDate?: string;
        bioSummary?: string;
        primaryDomain?: string;
        occupations?: Array<{ name: string; domain?: string }>;
        affiliations?: Array<{ name: string; role?: string; start?: string; end?: string }>;
        tags?: string[];
    };
    suggestedEdges?: Array<{
        targetName: string;
        edgeType: string;
        description?: string;
        confidence?: number;
    }>;
    suggestedEvents?: Array<{
        type: string;
        title: string;
        date: string;
    }>;
    summary?: string;
    error?: string;
    addedToGraph?: boolean;
    existingPersonId?: string;
    citations?: string[];
}

/**
 * Research panel modal for Perplexity-powered person lookup and graph enrichment.
 * @param onClose - Callback to close the modal.
 */
export default function ResearchPanel({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'new' | 'enrich'>('new');
    const [selectedPersonId, setSelectedPersonId] = useState<string>('');
    const [personFilter, setPersonFilter] = useState('');
    const persons = useGraphStore(s => s.persons);
    const setPersons = useGraphStore(s => s.setPersons);
    const setEdges = useGraphStore(s => s.setEdges);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount and tab switch
    useEffect(() => {
        if (activeTab === 'new') inputRef.current?.focus();
    }, [activeTab]);

    // Escape key closes modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Filtered persons for enrich dropdown
    const filteredPersons = personFilter
        ? persons.filter(p => p.canonicalName.toLowerCase().includes(personFilter.toLowerCase()))
        : persons;

    /** Execute research query against the backend Perplexity endpoint. */
    const handleResearch = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.research(query.trim(), false);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Research failed');
        } finally {
            setLoading(false);
        }
    }, [query]);

    /** Enrich an existing person with Perplexity research. */
    const handleEnrich = useCallback(async (personId?: string) => {
        const id = personId || selectedPersonId;
        if (!id) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.enrichPerson(id);
            setResult(data);

            // Reload graph data with enriched info
            const graphData = await api.getFullGraph();
            setPersons(graphData.nodes || []);
            setEdges(graphData.links || []);
        } catch (err: any) {
            setError(err.message || 'Enrichment failed');
        } finally {
            setLoading(false);
        }
    }, [selectedPersonId, setPersons, setEdges]);

    /** Add the researched person to the graph and reload data. */
    const handleAddToGraph = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const data = await api.research(query.trim(), true);
            setResult(data);

            // Reload graph data to include new person
            const graphData = await api.getFullGraph();
            setPersons(graphData.nodes || []);
            setEdges(graphData.links || []);
        } catch (err: any) {
            setError(err.message || 'Failed to add to graph');
        } finally {
            setLoading(false);
        }
    }, [query, setPersons, setEdges]);

    /** Handle Enter key in search input. */
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) handleResearch();
    }, [handleResearch, loading]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="research-dialog-title"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-2xl max-h-[85vh] bg-surface-900 border border-surface-700/50 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-surface-700/50 flex items-center justify-between">
                    <div>
                        <h2 id="research-dialog-title" className="text-lg font-bold text-surface-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Research Person
                        </h2>
                        <p className="text-xs text-surface-500 mt-0.5">Search for any historical figure to add to the graph</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
                        aria-label="Close research panel"
                    >
                        ✕
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="px-6 py-3 border-b border-surface-700/30 flex gap-1">
                    <button
                        onClick={() => { setActiveTab('new'); setResult(null); setError(null); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'new'
                            ? 'bg-accent/20 text-accent-light'
                            : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                            }`}
                        aria-pressed={activeTab === 'new'}
                    >
                        🔍 New Person
                    </button>
                    <button
                        onClick={() => { setActiveTab('enrich'); setResult(null); setError(null); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'enrich'
                            ? 'bg-accent/20 text-accent-light'
                            : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                            }`}
                        aria-pressed={activeTab === 'enrich'}
                    >
                        ✨ Enrich Existing
                    </button>
                </div>

                {/* Search Bar — New Person tab */}
                {activeTab === 'new' && (
                    <div className="px-6 py-4 border-b border-surface-700/30">
                        <div className="flex gap-2">
                            <label htmlFor="research-input" className="sr-only">Person name to research</label>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="e.g. Nikola Tesla, Ada Lovelace, Leonardo da Vinci..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="input-field flex-1 text-sm"
                                id="research-input"
                            />
                            <button
                                onClick={handleResearch}
                                disabled={loading || !query.trim()}
                                className="btn-primary px-5 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Researching…
                                    </span>
                                ) : 'Research'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Enrich Existing — Dropdown */}
                {activeTab === 'enrich' && (
                    <div className="px-6 py-4 border-b border-surface-700/30 space-y-3">
                        <label htmlFor="enrich-filter" className="sr-only">Filter existing persons</label>
                        <input
                            type="text"
                            placeholder="Filter persons..."
                            value={personFilter}
                            onChange={e => setPersonFilter(e.target.value)}
                            className="input-field text-sm w-full"
                            id="enrich-filter"
                        />
                        <div className="max-h-40 overflow-y-auto scrollbar-thin rounded-lg border border-surface-700/30 bg-surface-800/30">
                            {filteredPersons.length === 0 ? (
                                <p className="px-3 py-2 text-xs text-surface-500">No matching persons</p>
                            ) : (
                                filteredPersons
                                    .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName))
                                    .map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPersonId(p.id)}
                                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${selectedPersonId === p.id
                                                ? 'bg-accent/15 text-accent-light'
                                                : 'text-surface-300 hover:bg-surface-700/50'
                                                }`}
                                        >
                                            <span>{p.canonicalName}</span>
                                            <span className="text-[10px] text-surface-500 font-mono">
                                                {p.birthDate?.substring(0, 4) || '?'}–{p.deathDate?.substring(0, 4) || 'living'}
                                            </span>
                                        </button>
                                    ))
                            )}
                        </div>
                        <button
                            onClick={() => handleEnrich()}
                            disabled={loading || !selectedPersonId}
                            className="w-full btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Enriching…
                                </span>
                            ) : (
                                `✨ Enrich ${selectedPersonId ? persons.find(p => p.id === selectedPersonId)?.canonicalName || 'Selected' : 'Select a Person'}`
                            )}
                        </button>
                    </div>
                )}

                {/* Results */}
                <div className="px-6 py-4 overflow-y-auto max-h-[55vh] scrollbar-thin">
                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent-light text-sm mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Empty state */}
                    {!result && !loading && !error && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3 opacity-50" aria-hidden="true">🔬</div>
                            <p className="text-surface-400 text-sm">
                                Enter a person's name to search with Perplexity AI
                            </p>
                            <p className="text-surface-600 text-xs mt-1">
                                Results include biography, connections, timeline events, and more
                            </p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-12" role="status" aria-live="polite">
                            <svg className="w-10 h-10 mx-auto text-accent animate-spin-slow" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-surface-400 text-sm mt-4">
                                {activeTab === 'enrich' && selectedPersonId
                                    ? `Enriching ${persons.find(p => p.id === selectedPersonId)?.canonicalName || 'Person'}…`
                                    : `Researching "${query}"…`}
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {result && !loading && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Summary */}
                            {result.summary && (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <p className="text-sm text-surface-200 leading-relaxed">{result.summary}</p>
                                </div>
                            )}

                            {/* Person Card */}
                            {result.person && (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <h3 className="font-bold text-surface-100 text-lg">{result.person.canonicalName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {result.person.birthDate && (
                                            <span className="text-xs text-surface-400 font-mono">
                                                {result.person.birthDate?.substring(0, 4)}{result.person.deathDate ? ` — ${result.person.deathDate.substring(0, 4)}` : ' — present'}
                                            </span>
                                        )}
                                        {result.person.primaryDomain && (
                                            <span className="badge bg-accent/20 text-accent-light">
                                                {result.person.primaryDomain}
                                            </span>
                                        )}
                                    </div>
                                    {result.person.bioSummary && (
                                        <p className="text-sm text-surface-300 mt-2 leading-relaxed">{result.person.bioSummary}</p>
                                    )}

                                    {/* Occupations */}
                                    {result.person.occupations && result.person.occupations.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {result.person.occupations.map((occ, i) => (
                                                <span key={i} className="badge bg-surface-700/50 text-surface-300">{occ.name}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Suggested Connections */}
                            {result.suggestedEdges && result.suggestedEdges.length > 0 && (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                                        Suggested Connections ({result.suggestedEdges.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {result.suggestedEdges.map((edge, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-accent mt-0.5" aria-hidden="true">→</span>
                                                <div>
                                                    <span className="text-surface-200 font-medium">{edge.targetName}</span>
                                                    <span className="text-surface-500 ml-1.5 text-xs">{edge.edgeType.replace(/_/g, ' ').toLowerCase()}</span>
                                                    {edge.description && (
                                                        <p className="text-xs text-surface-500 mt-0.5">{edge.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Events */}
                            {result.suggestedEvents && result.suggestedEvents.length > 0 && (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                                        Timeline Events ({result.suggestedEvents.length})
                                    </h4>
                                    <div className="space-y-1.5">
                                        {result.suggestedEvents.map((event, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <span className="text-xs text-surface-500 font-mono w-12">{event.date?.substring(0, 4)}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
                                                <span className="text-surface-300">{event.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Citations */}
                            {result.citations && result.citations.length > 0 && (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Sources</h4>
                                    <div className="space-y-1">
                                        {result.citations.map((cite, i) => (
                                            <a key={i} href={cite} target="_blank" rel="noopener noreferrer"
                                                className="block text-xs text-accent hover:text-accent-light truncate">
                                                {cite}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add to Graph button */}
                            {result.person && !result.addedToGraph && !result.existingPersonId && (
                                <button
                                    onClick={handleAddToGraph}
                                    disabled={loading}
                                    className="w-full btn-primary py-3 text-sm font-semibold"
                                >
                                    ＋ Add {result.person.canonicalName} to Graph
                                </button>
                            )}

                            {result.addedToGraph && (
                                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center" role="status">
                                    <span className="text-sm text-accent-light font-medium">
                                        ✓ Added to graph — check the visualization!
                                    </span>
                                </div>
                            )}

                            {result.existingPersonId && (
                                <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/30 text-center space-y-2">
                                    <span className="text-sm text-surface-400">
                                        This person is already in the graph
                                    </span>
                                    <button
                                        onClick={() => handleEnrich(result.existingPersonId!)}
                                        disabled={loading}
                                        className="w-full btn-primary py-2 text-sm font-semibold"
                                    >
                                        ✨ Enrich Their Profile
                                    </button>
                                </div>
                            )}

                            {/* API key error */}
                            {result.error && (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <p className="text-sm text-surface-400">{result.error}</p>
                                    <p className="text-xs text-surface-500 mt-2 font-mono">
                                        export PERPLEXITY_API_KEY=pplx-xxx...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
