# AGENTS.md — shared/src/

All exports are re-exported from `index.ts`. Never import from submodules directly.

- Types use `export type` for interfaces
- Schemas use `export const` for Zod objects
- Enums use `export enum` with UPPER_SNAKE_CASE values
- Color maps are `Record<EnumType, string>` with hex color values
