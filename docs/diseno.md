# ¿Qué se celebra hoy? — diseño

Calendario de "Días de X" para Argentina: efemérides nacionales, días profesionales, conmemoraciones internacionales y fechas populares. No es una página de feriados ni de acontecimientos históricos.

## Decisiones de diseño

| # | Decisión | Ruling | Costo si está mal |
|---|----------|--------|-------------------|
| Q2 | Stack | Next.js 16.3 App Router + TS + Tailwind 4 + pnpm; vitest + zod | fijado por el pedido |
| Q3 | Persistencia | JSON por mes en `data/celebraciones/MM.json`, validado con zod en build y en tests. Sin DB: sin auth en v1, un backoffice web escribible sería un agujero si se deploya | migrar a SQLite/Supabase después es un loader nuevo, los JSON quedan como seed |
| Q4 | Backoffice | CLI `pnpm data:add` (interactivo, escribe el JSON validado) + `pnpm data:validate` + `pnpm data:links` (HTTP check de fuentes) + doc en README | si se quiere UI, se agrega sobre el mismo schema |
| Q5 | URLs | `/` hoy (ART, render por request) · `/fecha/DD-mes` (ej. `/fecha/11-septiembre`, SSG 366 páginas) · `/celebracion/[id]` · `/calendario/[mes]` · `/buscar?q=&alcance=&categoria=` | ninguno grave |
| Q6 | Fechas móviles | soportadas por regla `{ mes, ordinal (1..4 ó -1), diaSemana }` (Día de la Madre AR = 3er domingo de octubre, Día del Padre AR = 3er domingo de junio). Se resuelven para el año que se está viendo | sin esto faltarían las dos fechas populares más grandes del país |
| Q7 | Fuentes | cada entrada ≥1 fuente con `tipo` `institucional` (Estado, ONU/UNESCO/OMS/FAO/OIT…) o `asociacion` (colegio/asociación profesional oficial) o `normativa` (ley/decreto/resolución en Boletín Oficial o InfoLEG). Wikipedia sólo como `secundaria` y nunca sola. Sin fuente confiable → no entra | es la regla del pedido; el validador la hace cumplir |
| Q8 | Feriados | entran sólo si se llaman "Día de/del X" (Día de la Bandera, Día de la Independencia…) con categoría `historia`; los feriados sin nombre de "Día de" no | aclarado en README |
| Q9 | Orden en el día | Argentina primero (destacados antes), luego Internacional, luego Otros países; dentro de cada bloque alfabético | ninguno |
| Q10 | Búsqueda | client-side sobre el índice completo (~400 entradas, <150 KB), normaliza tildes y mayúsculas, busca en nombre + descripción + tags | ninguno |
| Q11 | Dark mode | clase `dark` en `<html>`, toggle con localStorage, default = sistema | ninguno |
| Q12 | Zona horaria | `America/Argentina/Buenos_Aires` vía `Intl.DateTimeFormat`, calculada en el server por request (`connection()`); la home nunca se prerenderiza | sin esto "hoy" sería el día del build |
| Q13 | 29 de febrero | página existe; en años no bisiestos el selector/navegación la saltea | mínimo |
| Q14 | Alcance de datos v1 | ~365 días cubiertos: todos los días internacionales oficiales ONU/UNESCO/OMS/FAO (~200) + ~150-200 argentinos (nacionales, profesionales, populares) + otros países sólo los muy conocidos (Chile, Uruguay, Brasil, México, España, EE.UU.) con fuente oficial del país | días sin entrada muestran estado vacío honesto |

## Modelo de datos (`src/types/celebracion.ts`, validado por `src/lib/schema.ts`)

```ts
type Alcance = "argentina" | "internacional" | "otro-pais";
type Categoria = "profesion" | "salud" | "ambiente" | "educacion" | "cultura" | "animales" | "comida" | "religion" | "historia" | "deporte" | "tecnologia" | "ciencia" | "sociedad" | "derechos" | "familia";
type TipoFuente = "institucional" | "asociacion" | "normativa" | "secundaria";

interface Fuente { nombre: string; url: string; tipo: TipoFuente }
interface FechaFija { dia: number; mes: number }             // 1..31, 1..12
interface FechaMovil { mes: number; ordinal: 1|2|3|4|-1; diaSemana: 0..6 } // 0 = domingo

interface Celebracion {
  id: string;                 // slug único kebab-case, ej. "dia-del-maestro"
  nombre: string;             // "Día del Maestro"
  fecha: FechaFija | FechaMovil;
  alcance: Alcance;
  pais?: string;              // obligatorio si alcance = otro-pais, ej. "Chile"
  categoria: Categoria;
  descripcion: string;        // una línea, ≤ 200 chars, termina en punto
  fuentes: Fuente[];          // ≥1, y ≥1 con tipo ≠ secundaria
  emoji?: string;
  tags?: string[];            // sinónimos para búsqueda: ["docente", "profesor"]
  destacado?: boolean;        // sube al tope del bloque
  verificadoEn: string;       // "2026-09-11", fecha en que se abrió la fuente
}
```

## Rutas y responsabilidades

- `src/lib/fechas.ts`: `hoyEnArgentina()`, `slugDeFecha({dia,mes})` ("11-septiembre"), `fechaDeSlug(slug)`, `MESES`, `resolverFechaMovil(regla, año)`, `fechaAnterior/fechaSiguiente`, `esBisiesto`.
- `src/lib/celebraciones.ts`: carga y valida los 12 JSON (cacheado en módulo), `celebracionesDeFecha(dia, mes, año)`, `celebracionPorId`, `contarPorDia(mes, año)` para el calendario, `agruparPorAlcance`.
- `src/lib/buscar.ts`: `normalizar(texto)`, `buscar(indice, query, filtros)`.
- `src/app/page.tsx` (hoy), `src/app/fecha/[slug]/page.tsx`, `src/app/celebracion/[id]/page.tsx`, `src/app/calendario/[mes]/page.tsx`, `src/app/buscar/page.tsx`, `sitemap.ts`, `robots.ts`, `not-found.tsx`.
- `src/components/`: `DiaHeader` (fecha + prev/next + selector), `ListaCelebraciones` (bloques por alcance), `CelebracionCard`, `CalendarioMes`, `Buscador`, `Filtros`, `ThemeToggle`, `Chip`.
- `scripts/validate-data.ts`, `scripts/check-links.ts`, `scripts/add-celebracion.ts`.

## Diseño visual

Mobile-first, app-like. Tipografía Geist (ya en el scaffold). Un solo acento: celeste argentino `#74ACDF` (light) / `#8CC4EE` (dark) en links, chips activos y el día actual del calendario; el resto neutros. Nada de gradientes ni tarjetas con sombra: bordes de 1px, radios 12px, listas densas. Cada celebración es una fila: emoji + nombre + chip de categoría + (chip de país si aplica), descripción de una línea, fuente como link discreto. Header sticky con la fecha grande ("Hoy, viernes 11 de septiembre") y flechas ◀ ▶ con `aria-label`. Todo con foco visible y contraste AA en ambos temas.

## Casos de prueba (tests/)
- 10 de septiembre → incluye "Día del Terapista Ocupacional" (argentina, profesion).
- 11 de septiembre → incluye "Día del Maestro" (argentina) y "Día Panamericano del Maestro" (internacional).
- 21 de septiembre → incluye "Día del Fotógrafo" (argentina), "Día de la Primavera" y "Día del Estudiante".
- Todos los JSON validan; ids únicos; toda entrada tiene una fuente no secundaria; `verificadoEn` es fecha ISO.
- `hoyEnArgentina()` con `Date` fija 2026-09-12T01:30Z devuelve 11/9 (todavía es viernes en Buenos Aires).
