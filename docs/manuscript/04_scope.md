# Scope and limitations {#sec:scope}

The local demonstration verifies the interaction and route behavior for
one small, fictional graph. It exercises real HTTP handlers with an
in-memory graph and makes no claim about Neo4j query performance,
large-network layout, or historical truth. The graph can store evidence
and a confidence value, but those fields do not establish the accuracy
of a recorded relationship.

The production path requires a Neo4j connection. The optional provider
integration can add or enrich records, but the live provider and its
outputs are outside this verification. The repository's local development
configuration is the operational context of the software description.
