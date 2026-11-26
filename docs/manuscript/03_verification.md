# Local verification {#sec:verification}

The native test command runs the shared schema and export checks, seed-data
integrity checks, and backend tests. Most backend cases exercise an
in-memory implementation of the store contract. The research-route
tests use Fastify request injection and stub responses from the upstream
provider. The workspace build checks TypeScript and produces the frontend
bundle.

A separate local demonstration loaded the fictional fixture through the
actual person, edge, and graph route handlers using the in-memory store.
The full graph returned Aria Vale, Mina Reed, and Theo Birch, with a
collaboration between Aria and Mina and a later correspondence between
Mina and Theo. The path endpoint returned the two-hop path from Aria to
Theo, and the person-events endpoint returned Aria's workshop notebook.
Requests without path parameters and with an unavailable person returned
the documented error statuses.

In the built browser interface, a directory query for Aria narrowed the
list. Selecting her record opened the inspector and displayed the workshop
notebook. Brushing a period that included the collaboration and excluded
the correspondence left one edge and preserved all three nodes and
lifespan bars. Clearing the filter restored both edges. The capture in
[@fig:fictional-timeline] shows the brushed state.

![The fictional graph shows one collaboration after brushing the timeline, three people, and Aria Vale's workshop notebook in the inspector.](../../output/figures/fictional-timeline.png){#fig:fictional-timeline width=96%}
