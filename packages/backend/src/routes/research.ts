import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';

/**
 * Research routes for Perplexity-powered person enrichment.
 * POST /api/research — research a person by name, returns structured biographical data.
 */
export async function researchRoutes(app: FastifyInstance): Promise<void> {

    /**
     * Normalize Perplexity person data to match the CreatePersonSchema.
     * Ensures all required fields exist with sensible defaults.
     */
    function normalizePersonData(raw: any): any {
        return {
            canonicalName: raw.canonicalName || 'Unknown',
            alternateNames: Array.isArray(raw.alternateNames) ? raw.alternateNames : [],
            birthDate: raw.birthDate || undefined,
            deathDate: raw.deathDate || undefined,
            occupations: Array.isArray(raw.occupations)
                ? raw.occupations.map((o: any) => ({
                    name: typeof o === 'string' ? o : (o.name || 'Unknown'),
                    domain: typeof o === 'string' ? undefined : o.domain,
                }))
                : [],
            affiliations: Array.isArray(raw.affiliations) ? raw.affiliations : [],
            bioSummary: raw.bioSummary || undefined,
            primaryDomain: raw.primaryDomain || undefined,
            tags: Array.isArray(raw.tags) ? raw.tags : [],
            confidence: typeof raw.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0.5,
        };
    }

    /**
     * Research a person using Perplexity API.
     * Accepts a person name, queries Perplexity for biographical data,
     * parses the result, and optionally adds the person to the graph.
     */
    app.post('/api/research', async (request, reply) => {
        const { query, addToGraph } = request.body as { query: string; addToGraph?: boolean };

        if (!query || !query.trim()) {
            return reply.code(400).send({ error: 'Query is required' });
        }

        const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

        try {
            let researchResult: any;
            const existingPersons = await store.getAllPersons();
            const existingNames = existingPersons.map(p => p.canonicalName);

            if (PERPLEXITY_API_KEY) {
                // Use Perplexity API directly
                researchResult = await callPerplexityAPI(query.trim(), PERPLEXITY_API_KEY, existingNames);
            } else {
                // Fallback: use structured search prompt without API key
                researchResult = await callPerplexityAPI(query.trim(), '', existingNames);
            }

            // Optionally add to graph
            if (addToGraph && researchResult.person) {
                const existing = await store.getAllPersons({ search: researchResult.person.canonicalName });
                if (existing.length === 0) {
                    const normalized = normalizePersonData(researchResult.person);
                    const created = await store.createPerson(normalized);
                    researchResult.person.id = created.id;
                    researchResult.addedToGraph = true;

                    // Add suggested edges
                    if (researchResult.suggestedEdges) {
                        researchResult.addedEdges = [];
                        for (const edgeData of researchResult.suggestedEdges) {
                            const target = existingPersons.find(p =>
                                p.canonicalName.toLowerCase() === edgeData.targetName.toLowerCase() ||
                                p.alternateNames?.some(alt => alt.toLowerCase() === edgeData.targetName.toLowerCase())
                            );
                            if (target) {
                                const edge = await store.createEdge({
                                    sourceId: created.id,
                                    targetId: target.id,
                                    edgeType: edgeData.edgeType || 'KNEW_OF',
                                    direction: edgeData.direction || 'BIDIRECTIONAL',
                                    confidence: edgeData.confidence || 0.4,
                                    description: edgeData.description,
                                });
                                researchResult.addedEdges.push(edge);
                            }
                        }
                    }

                    // Add suggested events
                    if (researchResult.suggestedEvents) {
                        for (const eventData of researchResult.suggestedEvents) {
                            await store.createEvent({
                                personId: created.id,
                                ...eventData,
                            });
                        }
                    }
                } else {
                    researchResult.addedToGraph = false;
                    researchResult.existingPersonId = existing[0].id;
                }
            }

            return reply.send(researchResult);
        } catch (err: any) {
            console.error('[Research] Error:', err.message);
            return reply.code(500).send({ error: `Research failed: ${err.message}` });
        }
    });

    /**
     * Enrich an existing person with additional research.
     * Updates the person's profile and creates any new edges/events.
     */
    app.post('/api/research/enrich/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const person = await store.getPersonById(id);

        if (!person) {
            return reply.code(404).send({ error: 'Person not found' });
        }

        const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

        try {
            const allPersons = await store.getAllPersons();
            const existingNames = allPersons.map(p => p.canonicalName);

            const result = await callPerplexityAPI(
                person.canonicalName,
                PERPLEXITY_API_KEY || '',
                existingNames
            );

            // Apply enrichment: update person with new data
            if (result.person) {
                const updates: Record<string, any> = {};
                if (result.person.birthDate && !person.birthDate) {
                    updates.birthDate = result.person.birthDate;
                }
                if (result.person.deathDate && !person.deathDate) {
                    updates.deathDate = result.person.deathDate;
                }
                if (result.person.bioSummary && !person.bioSummary) {
                    updates.bioSummary = result.person.bioSummary;
                }
                if (result.person.primaryDomain && !person.primaryDomain) {
                    updates.primaryDomain = result.person.primaryDomain;
                }
                if (Array.isArray(result.person.occupations) && result.person.occupations.length > 0) {
                    // Merge occupations (add new ones not already present)
                    const existingNames = new Set((person.occupations || []).map((o: any) => o.name?.toLowerCase()));
                    const newOccs = result.person.occupations
                        .map((o: any) => ({
                            name: typeof o === 'string' ? o : (o.name || 'Unknown'),
                            domain: typeof o === 'string' ? undefined : o.domain,
                        }))
                        .filter((o: any) => !existingNames.has(o.name?.toLowerCase()));
                    if (newOccs.length > 0) {
                        updates.occupations = [...(person.occupations || []), ...newOccs];
                    }
                }
                if (Array.isArray(result.person.tags) && result.person.tags.length > 0) {
                    const existingTags = new Set(person.tags || []);
                    const newTags = result.person.tags.filter((t: string) => !existingTags.has(t));
                    if (newTags.length > 0) {
                        updates.tags = [...(person.tags || []), ...newTags];
                    }
                }
                if (Object.keys(updates).length > 0) {
                    await store.updatePerson(id, updates);
                    result.enrichedFields = Object.keys(updates);
                }
            }

            // Add suggested edges that don't already exist
            if (result.suggestedEdges) {
                result.addedEdges = [];
                for (const edgeData of result.suggestedEdges) {
                    const target = allPersons.find(p =>
                        p.canonicalName.toLowerCase() === edgeData.targetName.toLowerCase() ||
                        p.alternateNames?.some(alt => alt.toLowerCase() === edgeData.targetName.toLowerCase())
                    );

                    if (target) {
                        // Check if edge already exists
                        const existingEdges = await store.getAllEdges();
                        const alreadyExists = existingEdges.some(
                            (e: any) =>
                                (e.sourceId === id && e.targetId === target.id) ||
                                (e.sourceId === target.id && e.targetId === id)
                        );
                        if (!alreadyExists) {
                            const edge = await store.createEdge({
                                sourceId: id,
                                targetId: target.id,
                                edgeType: edgeData.edgeType || 'KNEW_OF',
                                direction: edgeData.direction || 'BIDIRECTIONAL',
                                confidence: edgeData.confidence || 0.4,
                                description: edgeData.description,
                            });
                            result.addedEdges.push(edge);
                        }
                    }
                }
            }

            // Add suggested events
            if (result.suggestedEvents) {
                result.addedEvents = [];
                for (const eventData of result.suggestedEvents) {
                    try {
                        const event = await store.createEvent({
                            personId: id,
                            ...eventData,
                        });
                        result.addedEvents.push(event);
                    } catch {
                        // Skip duplicate events
                    }
                }
            }

            result.enrichedPersonId = id;
            return reply.send(result);
        } catch (err: any) {
            return reply.code(500).send({ error: `Enrichment failed: ${err.message}` });
        }
    });
}

/**
 * Call the Perplexity Sonar API for biographical research.
 * @param personName - The name of the person to research.
 * @param apiKey - Perplexity API key (if empty, returns a structured prompt response).
 * @param existingNames - Context of existing person names in the graph to prioritize for connections.
 * @returns Structured research result with person data, connections, and events.
 */
async function callPerplexityAPI(personName: string, apiKey: string, existingNames: string[] = []): Promise<any> {
    const namesContext = existingNames.length > 0
        ? `\n\nEXISTING PEOPLE IN GRAPH:\nIf suggesting connections in 'suggestedEdges', you MUST prioritize connecting to these EXACT canonical names if applicable: ${existingNames.join(', ')}`
        : '';

    const systemPrompt = `You are a historical research assistant. When given a person's name, provide structured biographical data. Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "person": {
    "canonicalName": "Full Name",
    "alternateNames": ["nicknames or aliases"],
    "birthDate": "YYYY-MM-DD or YYYY (REQUIRED — always research this)",
    "deathDate": "YYYY-MM-DD or YYYY or null if still living",
    "occupations": [{"name": "occupation", "domain": "domain"}],
    "affiliations": [{"name": "institution", "role": "role", "start": "YYYY", "end": "YYYY"}],
    "bioSummary": "2-3 sentence biography",
    "primaryDomain": "domain",
    "tags": ["tag1", "tag2"],
    "confidence": 0.6
  },
  "suggestedEdges": [
    {
      "targetName": "Name of connected person",
      "edgeType": "COLLABORATED_WITH",
      "direction": "BIDIRECTIONAL",
      "confidence": 0.5,
      "description": "Brief description of relationship"
    }
  ],
  "suggestedEvents": [
    {
      "type": "BIRTH",
      "title": "Event title",
      "date": "YYYY-MM-DD or YYYY",
      "description": "Brief description"
    }
  ],
  "summary": "A brief paragraph of the most important facts about this person."
}

Domains to use: architecture, systems-theory, art, music, dance, science, mathematics, philosophy, ecology, design, engineering, education, writing, journalism, family, policy, futurism, cybernetics, counterculture.
Edge types: KNEW_OF, READ_WORK_OF, CITED, INFLUENCED_BY, CORRESPONDED_WITH, MET_IN_PERSON, COLLABORATED_WITH, MENTORED, MENTORED_BY, TAUGHT, STUDENT_OF, PARENT_OF, CHILD_OF, SIBLING_OF, SPOUSE_OF, RELATIVE_OF, PATRON_OF, FUNDED_BY, EMPLOYED_BY, EMPLOYER_OF, CONTEMPORANEOUS_AT, OPPOSED, INSPIRED_WORK.
Event types: BIRTH, DEATH, EDUCATION, PUBLICATION, INVENTION, AWARD, POSITION, RESIDENCE, TRAVEL, COLLABORATION, MILESTONE.

Focus on connections to other notable thinkers, artists, scientists, and historical figures.

IMPORTANT: Always include birthDate and deathDate. Research birth and death years thoroughly. If the person is still living, set deathDate to null. If exact dates are unknown, use the year only (e.g. "1950"). Never omit birthDate — even an approximate year is valuable.${namesContext}`;

    const userPrompt = `Research this person and provide structured biographical data: ${personName}`;

    if (!apiKey) {
        // No API key — return a helpful message
        return {
            person: null,
            error: 'No PERPLEXITY_API_KEY environment variable set. Set it to enable live research.',
            query: personName,
            summary: `Research for "${personName}" requires a Perplexity API key. Set the PERPLEXITY_API_KEY environment variable and restart the backend.`,
        };
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'sonar',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 2000,
            temperature: 0.1,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Perplexity API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
        // Parse JSON from response (handle possible markdown code fences)
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        return {
            ...parsed,
            query: personName,
            source: 'perplexity',
            citations: data.citations || [],
        };
    } catch {
        // If JSON parsing fails, return raw content
        return {
            person: null,
            summary: content,
            query: personName,
            source: 'perplexity',
            parseError: true,
        };
    }
}
