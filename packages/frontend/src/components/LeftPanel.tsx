/**
 * @module LeftPanel
 * @description Left sidebar containing the person list, search filtering,
 * and relationship layer controls. Supports keyboard navigation and
 * provides visual cues through domain-colored dots.
 */

import React, { useMemo } from 'react';
import { DOMAIN_COLORS } from 'shared';
import { useGraphStore } from '../store/graphStore';
import LayerPanel from './LayerPanel';

/**
 * Left sidebar panel with person directory, search, and layer controls.
 * - Search filters by name, alternate names, tags, and domain.
 * - Person list shows domain-colored dots and year ranges.
 * - LayerPanel controls which edge categories are visible.
 */
export default function LeftPanel() {
    const persons = useGraphStore(s => s.persons);
    const searchQuery = useGraphStore(s => s.searchQuery);
    const setSearchQuery = useGraphStore(s => s.setSearchQuery);
    const selectPerson = useGraphStore(s => s.selectPerson);
    const selectedPersonId = useGraphStore(s => s.selectedPersonId);
    const hoverPerson = useGraphStore(s => s.hoverPerson);

    const filteredPersons = useMemo(() => {
        if (!searchQuery) return persons;
        const q = searchQuery.toLowerCase();
        return persons.filter(p =>
            p.canonicalName.toLowerCase().includes(q) ||
            p.alternateNames?.some(n => n.toLowerCase().includes(q)) ||
            p.tags?.some(t => t.toLowerCase().includes(q)) ||
            p.primaryDomain?.toLowerCase().includes(q)
        );
    }, [persons, searchQuery]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-surface-700/30">
                <h1 className="text-lg font-bold text-gradient mb-0.5">Timeline Generator</h1>
                <p className="text-xs text-surface-500">Networked Life Encoding</p>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-surface-700/30">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search people, tags, domains..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input-field pl-8 text-sm"
                        id="search-input"
                    />
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 text-xs"
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="mt-1.5 text-[10px] text-surface-500">
                    {filteredPersons.length} of {persons.length} persons
                </div>
            </div>

            {/* Person list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
                {filteredPersons.map(person => (
                    <button
                        key={person.id}
                        onClick={() => selectPerson(person.id)}
                        onMouseEnter={() => hoverPerson(person.id)}
                        onMouseLeave={() => hoverPerson(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150 group ${selectedPersonId === person.id
                            ? 'bg-accent/20 border border-accent/30'
                            : 'hover:bg-surface-800/50 border border-transparent'
                            }`}
                        id={`person-${person.id}`}
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: DOMAIN_COLORS[person.primaryDomain || 'default'] || DOMAIN_COLORS.default }}
                            />
                            <span className="text-sm font-medium text-surface-200 truncate group-hover:text-white transition-colors">
                                {person.canonicalName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 ml-5">
                            <span className="text-[10px] text-surface-500 font-mono">
                                {person.birthDate?.substring(0, 4) || '?'}–{person.deathDate?.substring(0, 4) || (person.birthDate ? 'present' : '?')}
                            </span>
                            {person.primaryDomain && (
                                <span className="text-[9px] text-surface-500 bg-surface-800/50 px-1.5 py-0.5 rounded-full">
                                    {person.primaryDomain}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Layer Panel */}
            <div className="border-t border-surface-700/30 p-3 max-h-[40%] overflow-y-auto scrollbar-thin">
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Relationship Layers
                </h3>
                <LayerPanel />
            </div>
        </div>
    );
}
