/**
 * @module GraphCanvas
 * @description D3 force-directed graph visualization of the person/edge network.
 * Renders nodes as circles colored by domain, edges as curved paths colored by
 * relationship category, and supports drag, hover, click-to-select, and
 * zoom/pan interaction.
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import type { Person, Edge } from 'shared';
import { EDGE_TYPE_TO_CATEGORY, EDGE_CATEGORY_COLORS, DOMAIN_COLORS, EdgeCategory } from 'shared';
import { useGraphStore } from '../store/graphStore';

/** Props for the GraphCanvas component. */
interface GraphCanvasProps {
    /** Width of the SVG canvas in pixels. */
    width: number;
    /** Height of the SVG canvas in pixels. */
    height: number;
}

interface SimNode extends Person {
    x: number;
    y: number;
    fx: number | null;
    fy: number | null;
    degree: number;
}

interface SimLink {
    source: SimNode | string;
    target: SimNode | string;
    edge: Edge;
}

export default function GraphCanvas({ width, height }: GraphCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

    const persons = useGraphStore(s => s.persons);
    const edges = useGraphStore(s => s.edges);
    const visibleCategories = useGraphStore(s => s.visibleCategories);
    const confidenceFloor = useGraphStore(s => s.confidenceFloor);
    const timeWindowStart = useGraphStore(s => s.timeWindowStart);
    const timeWindowEnd = useGraphStore(s => s.timeWindowEnd);
    const selectedPersonId = useGraphStore(s => s.selectedPersonId);
    const hoveredPersonId = useGraphStore(s => s.hoveredPersonId);
    const selectPerson = useGraphStore(s => s.selectPerson);
    const selectEdge = useGraphStore(s => s.selectEdge);
    const hoverPerson = useGraphStore(s => s.hoverPerson);

    const filteredEdges = useMemo(() => {
        return edges.filter(edge => {
            const category = EDGE_TYPE_TO_CATEGORY[edge.edgeType];
            if (!visibleCategories[category]) return false;
            if (edge.confidence < confidenceFloor) return false;
            if (timeWindowStart !== null || timeWindowEnd !== null) {
                const edgeStart = edge.startDate ? parseInt(edge.startDate.substring(0, 4)) : null;
                const edgeEnd = edge.endDate ? parseInt(edge.endDate.substring(0, 4)) : null;
                if (timeWindowStart !== null && edgeEnd !== null && edgeEnd < timeWindowStart) return false;
                if (timeWindowEnd !== null && edgeStart !== null && edgeStart > timeWindowEnd) return false;
            }
            return true;
        });
    }, [edges, visibleCategories, confidenceFloor, timeWindowStart, timeWindowEnd]);

    const getNodeRadius = useCallback((degree: number) => {
        return Math.max(8, Math.min(28, 6 + Math.sqrt(degree) * 5));
    }, []);

    useEffect(() => {
        if (!svgRef.current || persons.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Compute degrees
        const degreeMap = new Map<string, number>();
        filteredEdges.forEach(e => {
            degreeMap.set(e.sourceId, (degreeMap.get(e.sourceId) || 0) + 1);
            degreeMap.set(e.targetId, (degreeMap.get(e.targetId) || 0) + 1);
        });

        // Include all persons — isolated ones (no edges) still appear as nodes
        const connectedIds = new Set<string>();
        filteredEdges.forEach(e => {
            connectedIds.add(e.sourceId);
            connectedIds.add(e.targetId);
        });
        if (selectedPersonId) connectedIds.add(selectedPersonId);

        const nodes: SimNode[] = persons
            .map(p => ({
                ...p,
                x: width / 2 + (Math.random() - 0.5) * 200,
                y: height / 2 + (Math.random() - 0.5) * 200,
                fx: null,
                fy: null,
                degree: degreeMap.get(p.id) || 0,
            }));

        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        const links: SimLink[] = filteredEdges
            .filter(e => nodeMap.has(e.sourceId) && nodeMap.has(e.targetId))
            .map(e => ({
                source: e.sourceId,
                target: e.targetId,
                edge: e,
            }));

        // Container for zoom
        const container = svg.append('g').attr('class', 'graph-container');

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.15, 5])
            .on('zoom', (event) => {
                container.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Initial zoom to fit
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2));

        // Defs for gradients and arrowheads
        const defs = svg.append('defs');

        // Gold glow filter for selected nodes
        const filter = defs.append('filter')
            .attr('id', 'glow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
        filter.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '5').attr('result', 'blur');
        filter.append('feFlood').attr('flood-color', '#FFD700').attr('flood-opacity', '0.6').attr('result', 'gold');
        filter.append('feComposite').attr('in', 'gold').attr('in2', 'blur').attr('operator', 'in').attr('result', 'goldBlur');
        const merge = filter.append('feMerge');
        merge.append('feMergeNode').attr('in', 'goldBlur');
        merge.append('feMergeNode').attr('in', 'goldBlur');
        merge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Edge layer
        const edgeGroup = container.append('g').attr('class', 'edges');
        const edgeSelection = edgeGroup.selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'edge-path')
            .attr('stroke', d => {
                const cat = EDGE_TYPE_TO_CATEGORY[d.edge.edgeType];
                return d.edge.colorOverride || EDGE_CATEGORY_COLORS[cat] || '#94A3B8';
            })
            .attr('stroke-width', d => {
                const base = d.edge.weightOverride || (d.edge.strength || 0.5) * 3 + 0.5;
                return Math.max(0.5, base);
            })
            .attr('stroke-opacity', d => Math.max(0.15, d.edge.confidence * 0.7))
            .attr('stroke-dasharray', d => d.edge.confidence < 0.5 ? '5,5' : 'none')
            .style('cursor', 'pointer')
            .on('click', (_event, d) => {
                selectEdge(d.edge.id);
            })
            .on('mouseenter', function () {
                d3.select(this)
                    .attr('stroke-opacity', 1)
                    .attr('stroke-width', function (d: any) {
                        const base = d.edge.weightOverride || (d.edge.strength || 0.5) * 3 + 0.5;
                        return Math.max(2, base + 2);
                    });
            })
            .on('mouseleave', function () {
                d3.select(this)
                    .attr('stroke-opacity', (d: any) => Math.max(0.15, d.edge.confidence * 0.7))
                    .attr('stroke-width', (d: any) => {
                        const base = d.edge.weightOverride || (d.edge.strength || 0.5) * 3 + 0.5;
                        return Math.max(0.5, base);
                    });
            });

        // Edge type labels — visible on hover
        const edgeLabelGroup = container.append('g').attr('class', 'edge-labels');
        const edgeLabelSelection = edgeLabelGroup.selectAll('text')
            .data(links)
            .enter()
            .append('text')
            .attr('class', 'edge-label')
            .attr('text-anchor', 'middle')
            .attr('dy', -4)
            .style('font-size', '7px')
            .style('font-weight', '500')
            .style('fill', d => {
                const cat = EDGE_TYPE_TO_CATEGORY[d.edge.edgeType];
                return d.edge.colorOverride || EDGE_CATEGORY_COLORS[cat] || '#94A3B8';
            })
            .style('fill-opacity', 0.7)
            .style('pointer-events', 'none')
            .style('text-transform', 'lowercase')
            .style('letter-spacing', '0.02em')
            .text(d => d.edge.edgeType.replace(/_/g, ' '));

        // Node layer
        const nodeGroup = container.append('g').attr('class', 'nodes');
        const nodeSelection = nodeGroup.selectAll('g')
            .data(nodes, (d: any) => d.id)
            .enter()
            .append('g')
            .attr('class', 'node-group')
            .style('cursor', 'pointer')
            .on('click', (_event, d) => {
                selectPerson(d.id);
            })
            .on('mouseenter', (_event, d) => {
                hoverPerson(d.id);
            })
            .on('mouseleave', () => {
                hoverPerson(null);
            })
            .call(d3.drag<SVGGElement, SimNode>()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );

        // Node circles — outer ring (confidence)
        nodeSelection.append('circle')
            .attr('r', d => getNodeRadius(d.degree) + 2)
            .attr('fill', 'none')
            .attr('stroke', d => {
                const domain = d.primaryDomain || 'default';
                return DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
            })
            .attr('stroke-width', d => d.confidence > 0.8 ? 2.5 : 1.5)
            .attr('stroke-dasharray', d => d.birthDatePrecision === 'approximate' ? '3,3' : 'none')
            .attr('opacity', 0.7);

        // Node circles — main
        nodeSelection.append('circle')
            .attr('r', d => getNodeRadius(d.degree))
            .attr('fill', d => {
                const domain = d.primaryDomain || 'default';
                return DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
            })
            .attr('fill-opacity', 0.85)
            .attr('stroke', d => {
                const domain = d.primaryDomain || 'default';
                const color = DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
                return d3.color(color)?.darker(0.5)?.toString() || color;
            })
            .attr('stroke-width', 1.5);

        // Node labels
        nodeSelection.append('text')
            .attr('dy', d => getNodeRadius(d.degree) + 14)
            .attr('text-anchor', 'middle')
            .attr('class', 'fill-current')
            .style('font-size', '10px')
            .style('font-weight', '500')
            .style('fill', 'var(--text-secondary)')
            .style('pointer-events', 'none')
            .text(d => {
                const name = d.canonicalName;
                // Shorten long names
                if (name.length > 20) {
                    const parts = name.split(' ');
                    if (parts.length > 2) return `${parts[0][0]}. ${parts[parts.length - 1]}`;
                }
                return name;
            });

        // Birth-death labels (small) — collapses "1941–1941" to "1941"
        nodeSelection.append('text')
            .attr('dy', d => getNodeRadius(d.degree) + 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '8px')
            .style('font-family', 'var(--font-mono, monospace)')
            .style('fill', 'var(--text-muted)')
            .style('pointer-events', 'none')
            .text(d => {
                const birth = d.birthDate ? d.birthDate.substring(0, 4) : '?';
                const death = d.deathDate ? d.deathDate.substring(0, 4) : '';
                if (!death) return d.birthDate ? `${birth}–living` : birth;
                if (birth === death) return birth;
                return `${birth}–${death}`;
            });

        // Force simulation
        const simulation = d3.forceSimulation<SimNode>(nodes)
            .force('link', d3.forceLink<SimNode, SimLink>(links)
                .id(d => d.id)
                .distance(d => {
                    const strength = d.edge.strength || 0.5;
                    return 100 + (1 - strength) * 100;
                })
                .strength(d => (d.edge.strength || 0.5) * 0.6)
            )
            .force('charge', d3.forceManyBody()
                .strength(d => -(d as SimNode).degree * 30 - 100)
                .distanceMax(500)
            )
            .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
            .force('collision', d3.forceCollide<SimNode>()
                .radius(d => getNodeRadius(d.degree) + 20)
                .strength(0.7)
            )
            .force('x', d3.forceX(width / 2).strength(0.02))
            .force('y', d3.forceY(height / 2).strength(0.02))
            .velocityDecay(0.4)
            .alphaDecay(0.02);

        simulation.on('tick', () => {
            edgeSelection
                .attr('x1', d => (d.source as SimNode).x)
                .attr('y1', d => (d.source as SimNode).y)
                .attr('x2', d => (d.target as SimNode).x)
                .attr('y2', d => (d.target as SimNode).y);

            // Position edge labels at midpoint, rotated along edge angle
            edgeLabelSelection
                .attr('x', d => ((d.source as SimNode).x + (d.target as SimNode).x) / 2)
                .attr('y', d => ((d.source as SimNode).y + (d.target as SimNode).y) / 2)
                .attr('transform', d => {
                    const sx = (d.source as SimNode).x, sy = (d.source as SimNode).y;
                    const tx = (d.target as SimNode).x, ty = (d.target as SimNode).y;
                    const mx = (sx + tx) / 2, my = (sy + ty) / 2;
                    let angle = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;
                    if (angle > 90) angle -= 180;
                    if (angle < -90) angle += 180;
                    return `rotate(${angle}, ${mx}, ${my})`;
                });

            nodeSelection.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        simulationRef.current = simulation;

        return () => {
            simulation.stop();
        };
    }, [persons, filteredEdges, width, height, selectPerson, selectEdge, hoverPerson, getNodeRadius]);

    // Highlight selected/hovered nodes
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        svg.selectAll('.node-group').each(function (this: any, d: any) {
            const group = d3.select(this);
            const isSelected = d.id === selectedPersonId;
            const isHovered = d.id === hoveredPersonId;

            group.select('circle:nth-child(2)')
                .attr('fill-opacity', isSelected ? 1 : isHovered ? 0.95 : 0.85)
                .attr('stroke-width', isSelected ? 3 : isHovered ? 2.5 : 1.5)
                .attr('stroke', () => {
                    if (isSelected) return '#FFD700';
                    const domain = d.primaryDomain || 'default';
                    const color = DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
                    return d3.color(color)?.darker(0.5)?.toString() || color;
                });

            // Manage gold selection ring
            group.selectAll('.selection-ring').remove();
            if (isSelected) {
                group.insert('circle', ':first-child')
                    .attr('class', 'selection-ring')
                    .attr('r', (d as any).degree !== undefined ? Math.max(8, Math.min(28, 6 + Math.sqrt((d as any).degree) * 5)) + 6 : 14)
                    .attr('fill', 'none')
                    .attr('stroke', '#FFD700')
                    .attr('stroke-width', 2.5)
                    .attr('stroke-dasharray', '6,3')
                    .style('animation', 'gold-pulse 2s ease-in-out infinite');
                group.attr('filter', 'url(#glow)');
            } else {
                group.attr('filter', null);
            }
        });
    }, [selectedPersonId, hoveredPersonId]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            className="bg-grid"
            style={{ background: 'var(--graph-bg)' }}
        />
    );
}
