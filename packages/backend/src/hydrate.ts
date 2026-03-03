/**
 * @module hydrate
 * @description Neo4j seed data hydration and constraint management.
 * Called once on server boot to ensure the database has the required
 * schema constraints and initial seed data.
 */

import { getDriver } from './neo4j.js';
import { seedPersons, seedEdges, seedEvents } from 'seed-data';

/**
 * Apply uniqueness constraints to the Neo4j database.
 * Idempotent — safe to call on every boot.
 */
export async function applyConstraints(): Promise<void> {
    const session = getDriver().session();
    try {
        await session.executeWrite(tx => tx.run(
            `CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE`
        ));
        await session.executeWrite(tx => tx.run(
            `CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE`
        ));
        console.log('[Hydrate] Uniqueness constraints ensured');
    } finally {
        await session.close();
    }
}

/**
 * Serialize a JavaScript object for Neo4j property storage.
 * Nested objects/arrays are JSON-stringified since Neo4j properties
 * only support scalar values and flat arrays of scalars.
 */
function serializeForNeo4j(obj: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};
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

/**
 * Hydrate the Neo4j database with seed data if it is empty.
 * Checks for existing Person nodes first — skips hydration if any exist.
 */
export async function hydrateSeedData(): Promise<void> {
    const session = getDriver().session();
    try {
        // Check if database already has data
        const countResult = await session.executeRead(tx => tx.run(
            `MATCH (p:Person) RETURN count(p) as count`
        ));
        const existingCount = countResult.records[0].get('count').toNumber();

        if (existingCount > 0) {
            console.log(`[Hydrate] Database already contains ${existingCount} persons — skipping seed hydration`);
            return;
        }

        console.log('[Hydrate] Empty database detected — inserting seed data...');

        // ── Insert Persons ────────────────────────────────────────────
        for (const person of seedPersons) {
            const props = serializeForNeo4j(person);
            await session.executeWrite(tx => tx.run(
                `CREATE (p:Person $props)`,
                { props }
            ));
        }
        console.log(`[Hydrate] Inserted ${seedPersons.length} persons`);

        // ── Insert Edges (as typed relationships) ─────────────────────
        for (const edge of seedEdges) {
            const edgeType = edge.edgeType.replace(/[^A-Z_]/g, '');
            const props = serializeForNeo4j({
                id: edge.id,
                direction: edge.direction,
                confidence: edge.confidence,
                startDate: edge.startDate,
                endDate: edge.endDate,
                description: edge.description,
                evidence: edge.evidence,
            });

            await session.executeWrite(tx => tx.run(
                `MATCH (s:Person {id: $sourceId}), (t:Person {id: $targetId})
                 CREATE (s)-[r:\`${edgeType}\` $props]->(t)`,
                { sourceId: edge.sourceId, targetId: edge.targetId, props }
            ));
        }
        console.log(`[Hydrate] Inserted ${seedEdges.length} edges`);

        // ── Insert Events (as Event nodes linked via HAS_EVENT) ───────
        for (const event of seedEvents) {
            const props = serializeForNeo4j(event);
            await session.executeWrite(tx => tx.run(
                `MATCH (p:Person {id: $personId})
                 CREATE (p)-[:HAS_EVENT]->(e:Event $props)`,
                { personId: event.personId, props }
            ));
        }
        console.log(`[Hydrate] Inserted ${seedEvents.length} events`);

        console.log('[Hydrate] Seed data hydration complete ✅');
    } finally {
        await session.close();
    }
}
