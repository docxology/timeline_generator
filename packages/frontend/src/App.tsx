/**
 * @module App
 * @description Root application component orchestrating the three-panel layout
 * (left sidebar, center graph+timeline, right detail panel) with a floating
 * toolbar and research modal overlay. Handles initial data loading, responsive
 * panel sizing via ResizeObserver, and global UI state.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGraphStore } from './store/graphStore';
import { useUIStore } from './store/uiStore';
import { api } from './api/client';
import GraphCanvas from './graph/GraphCanvas';
import Timeline from './timeline/Timeline';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import ResearchPanel from './components/ResearchPanel';

export default function App() {
    const setPersons = useGraphStore(s => s.setPersons);
    const setEdges = useGraphStore(s => s.setEdges);
    const setLoading = useGraphStore(s => s.setLoading);
    const setError = useGraphStore(s => s.setError);
    const loading = useGraphStore(s => s.loading);
    const error = useGraphStore(s => s.error);
    const selectedPersonId = useGraphStore(s => s.selectedPersonId);

    const darkMode = useUIStore(s => s.darkMode);
    const toggleDarkMode = useUIStore(s => s.toggleDarkMode);
    const leftPanelOpen = useUIStore(s => s.leftPanelOpen);
    const rightPanelOpen = useUIStore(s => s.rightPanelOpen);
    const toggleLeftPanel = useUIStore(s => s.toggleLeftPanel);
    const setRightPanelOpen = useUIStore(s => s.setRightPanelOpen);

    const centerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [researchOpen, setResearchOpen] = useState(false);

    // Auto-open right panel when something is selected
    useEffect(() => {
        if (selectedPersonId) {
            setRightPanelOpen(true);
        }
    }, [selectedPersonId, setRightPanelOpen]);

    // Measure center panel
    const updateDimensions = useCallback(() => {
        if (centerRef.current) {
            const rect = centerRef.current.getBoundingClientRect();
            setDimensions({ width: rect.width, height: rect.height });
        }
    }, []);

    useEffect(() => {
        updateDimensions();
        const observer = new ResizeObserver(updateDimensions);
        if (centerRef.current) observer.observe(centerRef.current);
        window.addEventListener('resize', updateDimensions);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateDimensions);
        };
    }, [leftPanelOpen, rightPanelOpen, updateDimensions]);

    // Load data
    useEffect(() => {
        setLoading(true);
        api.getFullGraph()
            .then(data => {
                setPersons(data.nodes || []);
                setEdges(data.links || []);
                setError(null);
            })
            .catch(err => {
                setError(err.message || 'Failed to load graph data');
                console.error('[App] Failed to load data:', err);
            })
            .finally(() => setLoading(false));
    }, [setPersons, setEdges, setLoading, setError]);

    const timelineHeight = Math.min(220, dimensions.height * 0.25);
    const graphHeight = dimensions.height - timelineHeight;

    // Loading state
    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-surface-950">
                <div className="text-center space-y-4 animate-fade-in">
                    <div className="text-6xl animate-pulse-slow">🌐</div>
                    <h1 className="text-2xl font-bold text-gradient">Timeline Generator</h1>
                    <p className="text-sm text-surface-500">Loading knowledge graph…</p>
                    <div className="h-1 w-48 mx-auto bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-accent rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-surface-950">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-5xl">⚠️</div>
                    <h2 className="text-lg font-semibold text-surface-200">Connection Error</h2>
                    <p className="text-sm text-surface-400">{error}</p>
                    <p className="text-xs text-surface-500">Make sure the backend is running on port 3001</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex overflow-hidden">
            {/* Left Panel */}
            <div
                className={`glass-panel border-r border-surface-700/30 flex-shrink-0 transition-all duration-300 ${leftPanelOpen ? 'w-72' : 'w-0 overflow-hidden'
                    }`}
            >
                <LeftPanel />
            </div>

            {/* Center: Graph + Timeline */}
            <div className="flex-1 flex flex-col min-w-0 relative" ref={centerRef}>
                {/* Toolbar */}
                <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={toggleLeftPanel}
                            className="w-8 h-8 rounded-lg bg-surface-900/80 backdrop-blur border border-surface-700/30 flex items-center justify-center text-surface-400 hover:text-surface-200 transition-colors"
                            title="Toggle left panel"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={leftPanelOpen ? "M11 19l-7-7 7-7" : "M13 5l7 7-7 7"} />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        {/* Research Button */}
                        <button
                            onClick={() => setResearchOpen(true)}
                            className="h-8 px-3 rounded-lg bg-accent/90 hover:bg-accent backdrop-blur border border-accent-dark/30 flex items-center gap-1.5 text-white text-xs font-medium transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
                            title="Research & add people"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Research
                        </button>
                        <button
                            onClick={toggleDarkMode}
                            className="w-8 h-8 rounded-lg bg-surface-900/80 backdrop-blur border border-surface-700/30 flex items-center justify-center text-surface-400 hover:text-surface-200 transition-colors"
                            title="Toggle dark mode"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => setRightPanelOpen(!rightPanelOpen)}
                            className="w-8 h-8 rounded-lg bg-surface-900/80 backdrop-blur border border-surface-700/30 flex items-center justify-center text-surface-400 hover:text-surface-200 transition-colors"
                            title="Toggle details panel"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={rightPanelOpen ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Graph */}
                <div className="flex-1 min-h-0">
                    <GraphCanvas width={dimensions.width} height={graphHeight} />
                </div>

                {/* Timeline */}
                <div className="glass-panel border-t border-surface-700/30 flex-shrink-0">
                    <Timeline width={dimensions.width} height={timelineHeight} />
                </div>
            </div>

            {/* Right Panel */}
            <div
                className={`glass-panel border-l border-surface-700/30 flex-shrink-0 transition-all duration-300 ${rightPanelOpen ? 'w-80' : 'w-0 overflow-hidden'
                    }`}
            >
                <RightPanel />
            </div>

            {/* Research Modal */}
            {researchOpen && <ResearchPanel onClose={() => setResearchOpen(false)} />}
        </div>
    );
}
