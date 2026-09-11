# ¿Qué se celebra hoy? — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Cada unidad se despacha a un subagente fresco con prompt autocontenido; revisión por unidad y revisión final de rama.

**Goal:** app Next.js que responde "qué se celebra hoy" en Argentina, con calendario anual de "Días de X" sourceado.

**Architecture:** datos en JSON por mes validados con zod; libs de dominio puras (fechas, loader, búsqueda); App Router con home dinámica (ART) y 366 páginas de fecha prerenderizadas; búsqueda client-side sobre un índice liviano.

**Tech Stack:** Next.js 16.3, React 19, TypeScript, Tailwind 4, zod 4, vitest 5, pnpm.

**Spec:** docs/superpowers/specs/2026-09-11-que-se-celebra-hoy-design.md

## Global Constraints
- Sin comentarios en código salvo invariantes no obvias. Sin `Co-Authored-By` en commits.
- `pnpm test && pnpm typecheck && pnpm lint` limpios antes de cada commit.
- Toda celebración tiene ≥1 fuente no secundaria (lo hace cumplir `src/lib/schema.ts`).
- Zona horaria de "hoy": `America/Argentina/Buenos_Aires`, calculada por request.

## Unidades

| Unidad | Alcance | Modelo | Depende de |
|--------|---------|--------|------------|
| 0 Foundation | scaffold, types, schema, validador, vitest (hecho) | coordinador | — |
| D01..D12 Datos | `data/celebraciones/MM.json` + log de verificación por mes | sonnet ×12 en paralelo | 0 |
| A Libs | `src/lib/fechas.ts`, `celebraciones.ts`, `buscar.ts` con TDD | sonnet | 0 |
| B UI base | layout, tokens, dark mode, home, `/fecha/[slug]`, componentes de lista | opus | A (firmas), D09 (datos para probar) |
| C Calendario | `/calendario/[mes]`, `CalendarioMes` | sonnet | A, B |
| D Búsqueda | `/buscar`, `Buscador`, `Filtros` | sonnet | A, B |
| E Detalle+SEO+ops | `/celebracion/[id]`, sitemap, robots, `scripts/check-links.ts`, `scripts/add-celebracion.ts`, README | sonnet | A, B |
| V Verificación de datos | HTTP check de todas las URLs + auditoría aleatoria de logs | script + fable | D01..D12 |
| R Review | Codex (astra, medium) sobre el diff + gate Fable | — | todo |
| F Final | build, start, curl 10/11/21-septiembre, screenshots | coordinador | todo |

## Ledger
- 11:30 Ruling: sin backoffice web (sin auth en v1) → CLI + validador + README. Costo si está mal: una UI después sobre el mismo schema.
- 11:31 Ruling: fechas móviles soportadas desde v1 (Día de la Madre/Padre/Niño argentinos son móviles). Costo: un poco más de lógica en el loader.
- 11:40 Ruling: los 12 meses de datos se investigan en paralelo desde el inicio (el pedido dice "primero septiembre, después el año": septiembre lleva además los casos de prueba obligatorios y es el primero que se verifica).
