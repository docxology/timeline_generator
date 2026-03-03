# AGENTS.md — frontend/src/timeline/

Timeline uses D3 imperatively (not React rendering).

- Brush selection color is red (`rgba(220, 38, 38)`) — must never be blue
- Time scale domain comes from person birth/death date range
- Bar height adapts to available space and number of persons
- Brush events call `setTimeWindow()` on `graphStore`
