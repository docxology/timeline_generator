/**
 * @module Timeline
 * @description SVG-based horizontal timeline showing person lifespan bars.
 * Uses D3 for rendering. Supports brush-based time window filtering
 * and click-to-select. Bars are colored by person domain.
 */

import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { DOMAIN_COLORS } from 'shared';
import { useGraphStore } from '../store/graphStore';

interface TimelineProps {
    width: number;
    height: number;
}

export default function Timeline({ width, height }: TimelineProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const persons = useGraphStore(s => s.persons);
    const selectedPersonId = useGraphStore(s => s.selectedPersonId);
    const selectPerson = useGraphStore(s => s.selectPerson);
    const hoverPerson = useGraphStore(s => s.hoverPerson);
    const timeWindowStart = useGraphStore(s => s.timeWindowStart);
    const timeWindowEnd = useGraphStore(s => s.timeWindowEnd);
    const setTimeWindow = useGraphStore(s => s.setTimeWindow);

    const timeRange = useMemo(() => {
        let min = Infinity, max = -Infinity;
        persons.forEach(p => {
            const b = p.birthDate ? parseInt(p.birthDate.substring(0, 4)) : null;
            const d = p.deathDate ? parseInt(p.deathDate.substring(0, 4)) : null;
            if (b !== null && b < min) min = b;
            if (d !== null && d > max) max = d;
            if (b !== null && d === null && 2026 > max) max = 2026;
        });
        return { min: min === Infinity ? 1850 : min - 5, max: max === -Infinity ? 2026 : max + 5 };
    }, [persons]);

    const sortedPersons = useMemo(() => {
        return [...persons]
            .filter(p => p.birthDate)
            .sort((a, b) => {
                const aYear = parseInt(a.birthDate!.substring(0, 4));
                const bYear = parseInt(b.birthDate!.substring(0, 4));
                return aYear - bYear;
            });
    }, [persons]);

    useEffect(() => {
        if (!svgRef.current || sortedPersons.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 10 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const barHeight = Math.min(14, Math.max(6, innerHeight / sortedPersons.length - 2));
        const barGap = Math.max(1, barHeight * 0.3);

        const xScale = d3.scaleLinear()
            .domain([timeRange.min, timeRange.max])
            .range([0, innerWidth]);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Time axis
        const axisTickCount = Math.max(5, Math.floor(innerWidth / 80));
        const xAxis = d3.axisBottom(xScale)
            .ticks(axisTickCount)
            .tickFormat(d => String(d));

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll('text')
            .style('font-size', '9px')
            .style('fill', 'var(--text-muted)');

        g.selectAll('.domain, .tick line')
            .style('stroke', 'var(--text-muted)')
            .style('opacity', 0.3);

        // Decade gridlines
        const decades = d3.range(Math.ceil(timeRange.min / 10) * 10, timeRange.max, 10);
        g.selectAll('.decade-line')
            .data(decades)
            .enter()
            .append('line')
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .attr('stroke', 'var(--text-muted)')
            .attr('stroke-opacity', 0.1)
            .attr('stroke-dasharray', '2,4');

        // Time window brush
        const brush = d3.brushX<unknown>()
            .extent([[0, 0], [innerWidth, innerHeight]])
            .on('end', (event) => {
                if (!event.selection) {
                    setTimeWindow(null, null);
                    return;
                }
                const [x0, x1] = event.selection as [number, number];
                setTimeWindow(
                    Math.round(xScale.invert(x0)),
                    Math.round(xScale.invert(x1))
                );
            });

        const brushGroup = g.append('g')
            .attr('class', 'brush')
            .call(brush);

        // Style brush
        brushGroup.selectAll('.selection')
            .style('fill', 'rgba(220, 38, 38, 0.15)')
            .style('stroke', 'rgba(220, 38, 38, 0.5)')
            .style('stroke-width', '1px');

        // Set initial brush if time window exists
        if (timeWindowStart !== null && timeWindowEnd !== null) {
            brushGroup.call(brush.move, [xScale(timeWindowStart), xScale(timeWindowEnd)]);
        }

        // Person bars
        const personGroup = g.selectAll('.person-bar')
            .data(sortedPersons)
            .enter()
            .append('g')
            .attr('class', 'person-bar')
            .attr('transform', (_, i) => `translate(0,${i * (barHeight + barGap)})`)
            .style('cursor', 'pointer')
            .on('click', (_, d) => selectPerson(d.id))
            .on('mouseenter', (_, d) => hoverPerson(d.id))
            .on('mouseleave', () => hoverPerson(null));

        // Lifespan bars
        personGroup.append('rect')
            .attr('x', d => xScale(parseInt(d.birthDate!.substring(0, 4))))
            .attr('width', d => {
                const birth = parseInt(d.birthDate!.substring(0, 4));
                const death = d.deathDate ? parseInt(d.deathDate.substring(0, 4)) : 2026;
                return Math.max(2, xScale(death) - xScale(birth));
            })
            .attr('height', barHeight)
            .attr('rx', barHeight / 2)
            .attr('fill', d => DOMAIN_COLORS[d.primaryDomain || 'default'] || DOMAIN_COLORS.default)
            .attr('fill-opacity', d => d.id === selectedPersonId ? 1 : 0.6)
            .attr('stroke', d => d.id === selectedPersonId ? 'var(--selection-ring)' : 'none')
            .attr('stroke-width', 1.5);

        // Person name labels (only if space allows)
        if (barHeight >= 8) {
            personGroup.append('text')
                .attr('x', d => {
                    const birth = parseInt(d.birthDate!.substring(0, 4));
                    return xScale(birth) - 4;
                })
                .attr('y', barHeight / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'end')
                .style('font-size', `${Math.min(10, barHeight - 1)}px`)
                .style('fill', 'var(--text-secondary)')
                .style('pointer-events', 'none')
                .text(d => {
                    const name = d.canonicalName;
                    if (name.length > 18) {
                        const parts = name.split(' ');
                        return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : name.substring(0, 15);
                    }
                    return name;
                });
        }

    }, [sortedPersons, width, height, timeRange, selectedPersonId, selectPerson, hoverPerson, setTimeWindow, timeWindowStart, timeWindowEnd]);

    return (
        <div className="relative">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="select-none"
            />
            {timeWindowStart !== null && timeWindowEnd !== null && (
                <div className="absolute top-1 right-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-surface-400">
                        {timeWindowStart}–{timeWindowEnd}
                    </span>
                    <button
                        onClick={() => setTimeWindow(null, null)}
                        className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
                        title="Clear time filter"
                        aria-label="Clear time filter"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
