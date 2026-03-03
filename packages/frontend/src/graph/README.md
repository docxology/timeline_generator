# frontend/src/graph/

D3 force-directed graph visualization.

## GraphCanvas.tsx

SVG canvas with:

- **Nodes**: Circles colored by person domain, sized by degree
- **Edges**: Curved paths colored by relationship category
- **Interactions**: Drag, hover (glow), click-to-select, zoom/pan
- **Filtering**: Responds to category visibility, confidence floor, and time window from graphStore
