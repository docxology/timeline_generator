# Introduction {#sec:introduction}

A biography can contain relationships whose dates overlap only part of a
person's lifespan. A graph makes those relationships visible and a
timeline lets a reader examine their dates. Timeline Generator represents
a person as a persistent node, a relationship as a typed edge between
people, and an event as a dated record attached to its participant.

The browser uses D3 for SVG rendering, including the force graph and
timeline brush [@bostock2011d3]. Fastify supplies the HTTP route boundary
[@fastify2026reference]. Neo4j stores the graph and executes the persistent
store's Cypher queries [@neo4j2026cypher]. The repository includes a
historical seed network for exploration and a separate fictional fixture
for the verification described here.
