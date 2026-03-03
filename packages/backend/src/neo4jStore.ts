import { IGraphStore } from './store.js';
import type { Person, Edge, TemporalEvent, TimelineData, PathResult, NetworkResponse } from 'shared';
import { EdgeType } from 'shared';
import { getDriver } from './neo4j.js';
import { v4 as uuid } from 'uuid';

/**
 * Neo4j-backed graph store implementing the IGraphStore interface.
 * Uses Cypher queries to interact with the persistent Neo4j database.
 */
export class Neo4jStore implements IGraphStore {
    async getAllPersons(filters?: { search?: string; domain?: string; minYear?: number; maxYear?: number; }): Promise<Person[]> {
        const session = getDriver().session();
        try {
            let query = `MATCH (p:Person)`;
            const conditions: string[] = [];
            const params: any = {};

            if (filters?.search) {
                conditions.push(`(toLower(p.canonicalName) CONTAINS toLower($search) OR any(alias IN p.alternateNames WHERE toLower(alias) CONTAINS toLower($search)))`);
                params.search = filters.search;
            }
            if (filters?.domain) {
                conditions.push(`p.primaryDomain = $domain`);
                params.domain = filters.domain;
            }
            if (filters?.minYear) {
                conditions.push(`toInteger(substring(p.birthDate, 0, 4)) >= $minYear`);
                params.minYear = filters.minYear;
            }
            if (filters?.maxYear) {
                conditions.push(`toInteger(substring(p.birthDate, 0, 4)) <= $maxYear`);
                params.maxYear = filters.maxYear;
            }

            if (conditions.length > 0) {
                query += ` WHERE ` + conditions.join(' AND ');
            }

            query += ` RETURN p`;

            const result = await session.executeRead(tx => tx.run(query, params));
            return result.records.map(record => this.mapNodeToPerson(record.get('p')));
        } finally {
            await session.close();
        }
    }

    async getPersonById(id: string): Promise<Person | undefined> {
        const session = getDriver().session();
        try {
            const result = await session.executeRead(tx => tx.run(
                `MATCH (p:Person {id: $id}) RETURN p`,
                { id }
            ));
            if (result.records.length === 0) return undefined;
            return this.mapNodeToPerson(result.records[0].get('p'));
        } finally {
            await session.close();
        }
    }

    async createPerson(data: Omit<Person, 'id'>): Promise<Person> {
        const session = getDriver().session();
        const id = uuid();
        try {
            const props = { ...data, id };
            const result = await session.executeWrite(tx => tx.run(
                `CREATE (p:Person $props) RETURN p`,
                { props: this.serializeObject(props) }
            ));
            return this.mapNodeToPerson(result.records[0].get('p'));
        } finally {
            await session.close();
        }
    }

    async updatePerson(id: string, data: Partial<Person>): Promise<Person | undefined> {
        const session = getDriver().session();
        try {
            const result = await session.executeWrite(tx => tx.run(
                `MATCH (p:Person {id: $id})
                 SET p += $data
                 RETURN p`,
                { id, data: this.serializeObject(data) }
            ));
            if (result.records.length === 0) return undefined;
            return this.mapNodeToPerson(result.records[0].get('p'));
        } finally {
            await session.close();
        }
    }

    async deletePerson(id: string): Promise<boolean> {
        const session = getDriver().session();
        try {
            const result = await session.executeWrite(tx => tx.run(
                `MATCH (p:Person {id: $id})
                 DETACH DELETE p
                 RETURN count(p) as count`,
                { id }
            ));
            return result.records[0].get('count').toNumber() > 0;
        } finally {
            await session.close();
        }
    }

    async getAllEdges(): Promise<Edge[]> {
        const session = getDriver().session();
        try {
            const result = await session.executeRead(tx => tx.run(
                `MATCH (s:Person)-[r]->(t:Person) RETURN s.id as sourceId, t.id as targetId, type(r) as edgeType, r`
            ));
            return result.records.map(record => this.mapRelToEdge(record));
        } finally {
            await session.close();
        }
    }

    async getEdgeById(id: string): Promise<Edge | undefined> {
        const session = getDriver().session();
        try {
            const result = await session.executeRead(tx => tx.run(
                `MATCH (s:Person)-[r]->(t:Person) WHERE r.id = $id RETURN s.id as sourceId, t.id as targetId, type(r) as edgeType, r`,
                { id }
            ));
            if (result.records.length === 0) return undefined;
            return this.mapRelToEdge(result.records[0]);
        } finally {
            await session.close();
        }
    }

    async getEdgesForPerson(personId: string, edgeTypes?: EdgeType[]): Promise<Edge[]> {
        const session = getDriver().session();
        try {
            let query = `MATCH (s:Person)-[r]-(t:Person) WHERE s.id = $personId`;
            if (edgeTypes && edgeTypes.length > 0) {
                const typesStr = edgeTypes.map(t => "`" + t + "`").join('|');
                query = `MATCH (s:Person)-[r:${typesStr}]-(t:Person) WHERE s.id = $personId`;
            }
            query += ` RETURN startNode(r).id as sourceId, endNode(r).id as targetId, type(r) as edgeType, r`;

            const result = await session.executeRead(tx => tx.run(query, { personId }));

            // Deduplicate undirected returns since MATCH -[r]- matches both ways
            const uniqueEdges = new Map<string, Edge>();
            result.records.forEach(record => {
                const edge = this.mapRelToEdge(record);
                if (!uniqueEdges.has(edge.id)) uniqueEdges.set(edge.id, edge);
            });
            return Array.from(uniqueEdges.values());
        } finally {
            await session.close();
        }
    }

    async createEdge(data: Omit<Edge, 'id'>): Promise<Edge> {
        const session = getDriver().session();
        const id = uuid();
        try {
            // Can't parameterize relationship type in Cypher natively like node labels, must string inject
            const edgeType = data.edgeType.replace(/[^A-Z_]/g, '');
            const props = this.serializeObject({ ...data, id });
            // Delete sourceId, targetId, edgeType from props to avoid duplication on relationship properties
            delete (props as any).sourceId;
            delete (props as any).targetId;
            delete (props as any).edgeType;

            const query = `
                MATCH(s: Person { id: $sourceId }), (t: Person { id: $targetId })
                CREATE (s) - [r: \`${edgeType}\` $props]->(t)
                RETURN s.id as sourceId, t.id as targetId, type(r) as edgeType, r
            `;
            const result = await session.executeWrite(tx => tx.run(query, {
                sourceId: data.sourceId,
                targetId: data.targetId,
                props
            }));
            return this.mapRelToEdge(result.records[0]);
        } finally {
            await session.close();
        }
    }

    async updateEdge(id: string, data: Partial<Edge>): Promise<Edge | undefined> {
        const session = getDriver().session();
        try {
            const props = this.serializeObject(data);
            delete (props as any).sourceId;
            delete (props as any).targetId;
            delete (props as any).edgeType;
            delete (props as any).id;

            const result = await session.executeWrite(tx => tx.run(
                `MATCH (s:Person)-[r]->(t:Person) WHERE r.id = $id
                 SET r += $props
                 RETURN s.id as sourceId, t.id as targetId, type(r) as edgeType, r`,
                { id, props }
            ));
            if (result.records.length === 0) return undefined;
            return this.mapRelToEdge(result.records[0]);
        } finally {
            await session.close();
        }
    }

    async deleteEdge(id: string): Promise<boolean> {
        const session = getDriver().session();
        try {
            const result = await session.executeWrite(tx => tx.run(
                `MATCH ()-[r]->() WHERE r.id = $id
                 DELETE r
                 RETURN count(r) as count`,
                { id }
            ));
            return result.records[0].get('count').toNumber() > 0;
        } finally {
            await session.close();
        }
    }

    async getEventsForPerson(personId: string): Promise<TemporalEvent[]> {
        const session = getDriver().session();
        try {
            const result = await session.executeRead(tx => tx.run(
                `MATCH (p:Person {id: $personId})-[:HAS_EVENT]->(e:Event)
                 RETURN e ORDER BY e.date ASC`,
                { personId }
            ));
            return result.records.map(record => this.mapNodeToEvent(record.get('e')));
        } finally {
            await session.close();
        }
    }

    async createEvent(data: Omit<TemporalEvent, 'id'>): Promise<TemporalEvent> {
        const session = getDriver().session();
        const id = uuid();
        try {
            const props = this.serializeObject({ ...data, id });
            const result = await session.executeWrite(tx => tx.run(
                `MATCH (p:Person {id: $personId})
                 CREATE (p)-[:HAS_EVENT]->(e:Event $props)
                 RETURN e`,
                { personId: data.personId, props }
            ));
            return this.mapNodeToEvent(result.records[0].get('e'));
        } finally {
            await session.close();
        }
    }

    async getEgoNetwork(personId: string, depth: number = 1, edgeTypes?: EdgeType[]): Promise<NetworkResponse> {
        // Implement sub-graph extraction natively using Neo4j apoc or expanding paths
        const session = getDriver().session();
        try {
            // First verify center exists
            const centerCheck = await session.executeRead(tx => tx.run(
                `MATCH (p:Person {id: $personId}) RETURN p`, { personId }
            ));
            if (centerCheck.records.length === 0) throw new Error(`Person not found: ${personId}`);
            const center = this.mapNodeToPerson(centerCheck.records[0].get('p'));

            let typesStr = '';
            if (edgeTypes && edgeTypes.length > 0) {
                typesStr = ':' + edgeTypes.join('|');
            }

            // Subgraph extraction matching paths up to distance depth
            // We use apoc.path.subgraphAll to get nodes and rels easily if APOC is present,
            // or we use variable length paths
            const query = `
                MATCH path = (center:Person {id: $personId})-[r${typesStr}*0..${depth}]-(neighbor:Person)
                UNWIND nodes(path) AS n
                UNWIND relationships(path) AS rel
                RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT rel) AS edges
            `;
            const result = await session.executeRead(tx => tx.run(query, { personId }));

            if (result.records.length === 0) {
                return { center, neighbors: [], edges: [] };
            }

            const nodes = result.records[0].get('nodes').map((n: any) => this.mapNodeToPerson(n));

            const relMap = new Map();
            result.records[0].get('edges').forEach((rel: any) => {
                // To properly map edges we need sourceId and targetId
                // The relationship returned from path doesn't explicitly guarantee start/end node ID easily without properties
                // but Neo4j JS driver relationships have .start and .end matching node identities
                // It's safer to extract them by matching the nodes back, but if we stored sourceId/targetId on the edge (we do),
                // we can just map it! Wait, we deleted them in createEdge to avoid duplication.
                // It's cleaner to query them explicitly. Let's adjust the query.
            });

            // Alternative query for safe parsing
            const safeQuery = `
                MATCH path = (center:Person {id: $personId})-[r${typesStr}*0..${depth}]-(neighbor:Person)
                UNWIND nodes(path) AS n
                UNWIND relationships(path) AS rel
                WITH DISTINCT n, rel
                RETURN collect(DISTINCT n) AS nodes, 
                       collect(DISTINCT {r: rel, sourceId: startNode(rel).id, targetId: endNode(rel).id, edgeType: type(rel)}) AS edges
            `;
            const safeResult = await session.executeRead(tx => tx.run(safeQuery, { personId }));

            const allNodes = safeResult.records[0].get('nodes').map((n: any) => this.mapNodeToPerson(n));
            const neighbors = allNodes.filter((n: Person) => n.id !== personId);

            const edgesList = safeResult.records[0].get('edges').map((e: any) => {
                if (e.r == null) return null; // Can happen if 0 edges
                const props = e.r.properties;
                return {
                    id: props.id,
                    sourceId: e.sourceId,
                    targetId: e.targetId,
                    edgeType: e.edgeType as EdgeType,
                    direction: props.direction,
                    confidence: props.confidence,
                    startDate: props.startDate,
                    endDate: props.endDate,
                    description: props.description,
                    evidence: props.evidence ? JSON.parse(props.evidence) : undefined,
                } as Edge;
            }).filter(Boolean);

            // Deduplicate edges
            const uniqueEdges = new Map<string, Edge>();
            edgesList.forEach((e: Edge) => {
                if (!uniqueEdges.has(e.id)) uniqueEdges.set(e.id, e);
            });

            return { center, neighbors, edges: Array.from(uniqueEdges.values()) };
        } finally {
            await session.close();
        }
    }

    async findShortestPath(fromId: string, toId: string): Promise<PathResult | null> {
        const session = getDriver().session();
        try {
            // Check existence
            const existence = await session.executeRead(tx => tx.run(
                `MATCH (a:Person {id: $fromId}), (b:Person {id: $toId}) RETURN count(a) as a, count(b) as b`,
                { fromId, toId }
            ));
            if (existence.records[0].get('a').toNumber() === 0 || existence.records[0].get('b').toNumber() === 0) return null;

            if (fromId === toId) {
                const nodeRes = await session.executeRead(tx => tx.run(`MATCH (p:Person {id: $fromId}) RETURN p`, { fromId }));
                return { path: [this.mapNodeToPerson(nodeRes.records[0].get('p'))], edges: [], totalHops: 0 };
            }

            const query = `
                MATCH (start:Person {id: $fromId}), (end:Person {id: $toId})
                MATCH path = shortestPath((start)-[*]-(end))
                RETURN path
            `;
            const result = await session.executeRead(tx => tx.run(query, { fromId, toId }));
            if (result.records.length === 0 || !result.records[0].get('path')) return null;

            const pathObj = result.records[0].get('path');

            // Reconstruct path
            // The JS driver returns a Path object with segments
            const persons: Person[] = [];
            const edges: Edge[] = [];

            // Add the start node
            persons.push(this.mapNodeToPerson(pathObj.start));

            for (const segment of pathObj.segments) {
                // segment.relationship, segment.end
                const rel = segment.relationship;

                // Map sourceId/targetId from the segment's start/end node properties
                const segStart = segment.start.properties;
                const segEnd = segment.end.properties;
                const edgeProps = rel.properties;
                const edge: Edge = {
                    id: edgeProps.id,
                    sourceId: segStart.id,
                    targetId: segEnd.id,
                    edgeType: rel.type as EdgeType,
                    direction: edgeProps.direction,
                    confidence: edgeProps.confidence,
                    description: edgeProps.description
                };
                edges.push(edge);
                persons.push(this.mapNodeToPerson(segment.end));
            }

            // Quick secondary pass to map source/target correctly
            // Since shortest path can traverse backwards, we fetch the real directions
            if (edges.length > 0) {
                const edgeIds = edges.map(e => e.id);
                const relsRes = await session.executeRead(tx => tx.run(
                    `MATCH (s:Person)-[r]->(t:Person) WHERE r.id IN $edgeIds
                     RETURN r.id as id, s.id as sourceId, t.id as targetId`,
                    { edgeIds }
                ));
                relsRes.records.forEach(r => {
                    const id = r.get('id');
                    const targetEdge = edges.find(e => e.id === id);
                    if (targetEdge) {
                        targetEdge.sourceId = r.get('sourceId');
                        targetEdge.targetId = r.get('targetId');
                    }
                });
            }

            return { path: persons, edges, totalHops: edges.length };
        } finally {
            await session.close();
        }
    }

    async getTimelineData(personIds?: string[]): Promise<TimelineData> {
        const session = getDriver().session();
        try {
            // First fetch persons and their events
            let personQuery = `MATCH (p:Person) OPTIONAL MATCH (p)-[:HAS_EVENT]->(e:Event)`;
            const params: any = {};

            if (personIds && personIds.length > 0) {
                personQuery += ` WHERE p.id IN $personIds`;
                params.personIds = personIds;
            }
            personQuery += ` RETURN p, collect(e) as events`;

            const pResult = await session.executeRead(tx => tx.run(personQuery, params));

            const personsSet = new Set<string>();
            let minYear = Infinity;
            let maxYear = -Infinity;

            const timelinePersons = pResult.records.map(r => {
                const p = this.mapNodeToPerson(r.get('p'));
                personsSet.add(p.id);

                const events = r.get('events').filter((e: any) => e != null).map((e: any) => this.mapNodeToEvent(e))
                    .sort((a: any, b: any) => a.date.localeCompare(b.date));

                const birthYear = p.birthDate ? parseInt(p.birthDate.substring(0, 4)) : null;
                const deathYear = p.deathDate ? parseInt(p.deathDate.substring(0, 4)) : null;
                if (birthYear !== null && birthYear < minYear) minYear = birthYear;
                if (deathYear !== null && deathYear > maxYear) maxYear = deathYear;
                if (birthYear !== null && (deathYear === null) && 2026 > maxYear) maxYear = 2026;

                return {
                    id: p.id,
                    name: p.canonicalName,
                    birthYear,
                    deathYear,
                    domain: p.primaryDomain || 'default',
                    events
                };
            });

            // Fetch edges between these persons
            let edgeQuery = `MATCH (s:Person)-[r]->(t:Person)`;
            if (personIds && personIds.length > 0) {
                edgeQuery += ` WHERE s.id IN $personIds AND t.id IN $personIds`;
            }
            edgeQuery += ` RETURN s.id as sourceId, t.id as targetId, type(r) as edgeType, r`;

            const eResult = await session.executeRead(tx => tx.run(edgeQuery, params));
            const timelineEdges = eResult.records.map(r => {
                const rel = r.get('r');
                const props = rel.properties;
                return {
                    id: props.id,
                    sourceId: r.get('sourceId'),
                    targetId: r.get('targetId'),
                    type: r.get('edgeType'),
                    startYear: props.startDate ? parseInt(props.startDate.substring(0, 4)) : null,
                    endYear: props.endDate ? parseInt(props.endDate.substring(0, 4)) : null,
                    confidence: props.confidence
                };
            });

            return {
                persons: timelinePersons,
                edges: timelineEdges,
                timeRange: {
                    min: minYear === Infinity ? 1850 : minYear,
                    max: maxYear === -Infinity ? 2025 : maxYear,
                },
            };
        } finally {
            await session.close();
        }
    }

    async getDegreesMap(): Promise<Map<string, number>> {
        const session = getDriver().session();
        try {
            const query = `
                MATCH (p:Person)-[r]-()
                RETURN p.id as id, count(r) as degree
            `;
            const result = await session.executeRead(tx => tx.run(query));
            const map = new Map<string, number>();
            result.records.forEach(r => {
                map.set(r.get('id'), r.get('degree').toNumber());
            });
            // Also need to set 0 for isolated nodes
            const isolatedQuery = `
                MATCH (p:Person) WHERE NOT (p)--() RETURN p.id as id
            `;
            const isolatedResult = await session.executeRead(tx => tx.run(isolatedQuery));
            isolatedResult.records.forEach(r => {
                map.set(r.get('id'), 0);
            });

            return map;
        } finally {
            await session.close();
        }
    }

    async getCounts(): Promise<{ persons: number; edges: number; events: number; }> {
        const session = getDriver().session();
        try {
            const result = await session.executeRead(tx => tx.run(`
                MATCH (p:Person) WITH count(p) as persons
                OPTIONAL MATCH ()-[r]->() WITH persons, count(r) as edges
                OPTIONAL MATCH (e:Event) RETURN persons, edges, count(e) as events
            `));
            const r = result.records[0];
            return {
                persons: r.get('persons').toNumber(),
                edges: r.get('edges').toNumber(),
                events: r.get('events').toNumber()
            };
        } finally {
            await session.close();
        }
    }

    // ── Serialization Helpers ───────────────────────────────────────

    private mapNodeToPerson(node: any): Person {
        const props = node.properties;
        return {
            ...props,
            alternateNames: props.alternateNames ? JSON.parse(props.alternateNames) : undefined,
            occupations: props.occupations ? JSON.parse(props.occupations) : undefined,
            affiliations: props.affiliations ? JSON.parse(props.affiliations) : undefined,
            tags: props.tags ? JSON.parse(props.tags) : undefined,
        } as Person;
    }

    private mapRelToEdge(record: any): Edge {
        const sourceId = record.get('sourceId');
        const targetId = record.get('targetId');
        const edgeType = record.get('edgeType');
        const rel = record.get('r');
        const props = rel.properties;

        return {
            id: props.id,
            sourceId,
            targetId,
            edgeType: edgeType as EdgeType,
            direction: props.direction,
            confidence: props.confidence,
            startDate: props.startDate,
            endDate: props.endDate,
            description: props.description,
            evidence: props.evidence ? JSON.parse(props.evidence) : undefined,
        } as Edge;
    }

    private mapNodeToEvent(node: any): TemporalEvent {
        const props = node.properties;
        return {
            ...props,
            participants: props.participants ? JSON.parse(props.participants) : undefined
        } as TemporalEvent;
    }

    /**
     * Translates rich nested objects into JSON strings for Neo4j storage
     * because Neo4j properties cannot be nested maps or array of maps.
     */
    private serializeObject(obj: any): any {
        const clean: any = {};
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (val === undefined || val === null) continue;
            if (typeof val === 'object') {
                clean[key] = JSON.stringify(val);
            } else {
                clean[key] = val;
            }
        }
        return clean;
    }
}
