# Abstract {#sec:abstract}

Timeline Generator is a browser application for representing people, dated
events, and typed relationships in a temporal knowledge graph. It links
a force-directed graph, person and relationship inspectors, and a
brushable lifespan timeline. A Fastify API supplies graph and person data
through a store interface backed by Neo4j in the running application.
This software report describes the data model and documents a local
verification using a fictional fixture. The verification covers payload
assembly, path lookup, person-event display, and filtering relationships
with the timeline brush.
