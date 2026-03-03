import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { personRoutes } from './routes/persons.js';
import { edgeRoutes } from './routes/edges.js';
import { graphRoutes } from './routes/graph.js';
import { researchRoutes } from './routes/research.js';
import { initNeo4j, closeNeo4j } from './neo4j.js';
import { Neo4jStore } from './neo4jStore.js';
import { setGraphStore } from './store.js';
import { hydrateSeedData, applyConstraints } from './hydrate.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main(): Promise<void> {
    const app = Fastify({
        logger: {
            level: 'info',
            transport: {
                target: 'pino-pretty',
                options: { colorize: true },
            },
        },
    });

    // ── Neo4j Initialization ──────────────────────────────────────────
    try {
        await initNeo4j();
        console.log('[Server] Neo4j driver initialized');

        // Apply uniqueness constraints
        await applyConstraints();
        console.log('[Server] Neo4j constraints applied');

        // Hydrate seed data if database is empty
        await hydrateSeedData();

        // Swap the global store to Neo4jStore
        const neo4jStore = new Neo4jStore();
        setGraphStore(neo4jStore);
        console.log('[Server] Store switched to Neo4jStore (persistent)');
    } catch (err) {
        console.error('[Server] Neo4j initialization failed:', err);
        process.exit(1);
    }

    // ── CORS ──────────────────────────────────────────────────────────
    await app.register(cors, {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // ── Routes ────────────────────────────────────────────────────────
    await app.register(personRoutes);
    await app.register(edgeRoutes);
    await app.register(graphRoutes);
    await app.register(researchRoutes);

    // ── Health Check ──────────────────────────────────────────────────
    app.get('/api/health', async () => ({
        status: 'ok',
        version: '1.0.0',
        name: 'Timeline Generator API',
        engine: 'neo4j',
        timestamp: new Date().toISOString(),
    }));

    // ── Graceful Shutdown ─────────────────────────────────────────────
    const shutdown = async () => {
        console.log('\n[Server] Shutting down...');
        await app.close();
        await closeNeo4j();
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // ── Start ─────────────────────────────────────────────────────────
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`\n🌐 Timeline Generator API running at http://localhost:${PORT}`);
        console.log(`   Engine: Neo4j Graph Database`);
        console.log(`   Health: http://localhost:${PORT}/api/health`);
        console.log(`   Persons: http://localhost:${PORT}/api/persons`);
        console.log(`   Graph: http://localhost:${PORT}/api/graph/full\n`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

main();
