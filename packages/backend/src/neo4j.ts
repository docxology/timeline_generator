import neo4j, { Driver } from 'neo4j-driver';

export const TIMELINE_DB = 'neo4j'; // Default community db name

let driver: Driver | null = null;

export async function initNeo4j() {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'secretPassword';

    try {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
        const serverInfo = await driver.getServerInfo();
        console.log(`[Neo4j] Connected successfully to ${serverInfo.address}`);
        return driver;
    } catch (error) {
        console.error(`[Neo4j] Connection error:`, error);
        throw error;
    }
}

export function getDriver(): Driver {
    if (!driver) {
        throw new Error('Neo4j Driver has not been initialized. Call initNeo4j first.');
    }
    return driver;
}

export async function closeNeo4j() {
    if (driver) {
        await driver.close();
        driver = null;
        console.log('[Neo4j] Connection closed.');
    }
}
