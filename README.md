# ¿Qué se celebra hoy?

Calendario de "Días de X" para Argentina y Colombia: días nacionales, días profesionales, conmemoraciones internacionales (ONU, UNESCO, OMS, FAO, OIT) y fechas populares como el Día de la Madre o el Día del Estudiante. Cada celebración lleva al menos una fuente verificable.

Debajo de las celebraciones, cada día muestra además sus **efemérides**: acontecimientos, nacimientos y fallecimientos de ese día en la historia ("1945 – Nace Tanguito, músico y compositor argentino"), con foco en cada país. Se importan de Wikipedia con un script y no se editan a mano.

No es una página de feriados (salvo que se llamen "Día de/del X", como el Día de la Bandera).

## Países

El sitio tiene una vista por país. Argentina vive en la raíz (`/`, `/fecha/...`, `/calendario/...`, `/buscar`) y Colombia bajo el prefijo `/co` (`/co`, `/co/fecha/...`, `/co/calendario/...`, `/co/buscar`). En el header, el selector 🇦🇷 | 🇨🇴 pasa de un país al otro conservando la página, y el menú, la barra inferior y los links de cada vista se quedan dentro del país que se está mirando.

En cada vista el orden del día es: primero lo del país, después lo internacional y al final "Otros países", que incluye lo del otro país del sitio (una celebración colombiana aparece en Argentina, con su bandera, dentro de "Otros países", y al revés). Las celebraciones tienen una sola página de detalle por id, que se abre con o sin el prefijo (`/celebracion/<id>` y `/co/celebracion/<id>`).

La configuración de cada país (alcance, zona horaria, prefijo, bandera) está en `src/lib/paises.ts`. Los cuerpos de las páginas están en `src/vistas/` y los comparten los dos países; `src/app/` y `src/app/co/` sólo los enchufan a cada ruta.

Colombia no tiene la cobertura de Argentina: sus celebraciones son las que se pudieron confirmar con fuente oficial, así que muchos días de `/co` muestran sólo lo internacional y lo de otros países (ver [Cobertura de datos](#cobertura-de-datos)).

## Cómo correr

```bash
pnpm install
pnpm dev
```

Abrí `http://localhost:3000`.

Para probar una build de producción:

```bash
pnpm build
pnpm start
```

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm test` | corre los tests con vitest |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm data:validate` | valida todos los `data/celebraciones/MM.json` contra el schema, revisa ids duplicados y que `fecha.mes` coincida con el archivo |
| `pnpm data:links` | hace HEAD/GET (y fallback con `curl`) a cada URL de fuente de todos los meses, o de uno solo con `pnpm data:links 09` |
| `pnpm data:add` | CLI interactiva para agregar una celebración nueva (ver más abajo) |
| `pnpm data:efemerides` | importa las efemérides de todo el año desde Wikipedia a `data/efemerides/MM.json`, o de un mes con `pnpm data:efemerides 9`; con `--solo colombia` agrega las colombianas que todavía no están, conserva las que ya están y pasa a `colombia` (con `tambienInternacional`) las internacionales que coinciden con una colombiana; el resto queda igual (ver [Efemérides](#efemérides)) |

`pnpm data:validate` valida también `data/efemerides/`; `pnpm data:links efemerides` (o `pnpm data:links efemerides 09`) chequea las URLs de las efemérides.

Antes de cualquier commit que toque `data/`, corré `pnpm data:validate` y `pnpm data:links`.

## Estructura

```
data/celebraciones/MM.json   datos por mes (01.json a 12.json)
data/efemerides/MM.json      efemérides por mes, generadas por `pnpm data:efemerides`
src/types/celebracion.ts     tipos: Celebracion, Alcance, Categoria, TipoFuente
src/types/efemeride.ts       tipo Efemeride
src/lib/schema.ts            schemas zod que validan cada celebración y cada efeméride
src/lib/paises.ts            configuración de cada país (alcance, zona horaria, prefijo), rutas y agrupación por alcance
src/lib/fechas.ts            zona horaria, slugs de fecha, fechas móviles
src/lib/celebraciones.ts     carga y consulta de los JSON (cacheado)
src/lib/efemerides.ts        carga y consulta de las efemérides (cacheado)
src/lib/buscar.ts            normalización y búsqueda client-side
src/lib/datos-edicion.ts     funciones puras que usa el CLI de alta
src/vistas/                  cuerpo de cada página, compartido por Argentina y Colombia
src/app/                     rutas de Argentina (App Router)
src/app/co/                  rutas de Colombia, bajo el prefijo /co
src/components/              componentes de UI
scripts/                     CLI y validadores
```

Rutas principales:

| Ruta | Qué muestra |
|---|---|
| `/` | qué se celebra hoy, calculado en el momento (hora de Argentina), y las efemérides del día |
| `/co` | lo mismo para Colombia (hora de Bogotá) |
| `/fecha/11-septiembre` | todo lo que se celebra ese día del año, y sus efemérides |
| `/celebracion/dia-del-maestro` | el detalle de una celebración: descripción, fuentes, fecha en palabras si es móvil |
| `/calendario/septiembre` | el mes completo, día por día |
| `/buscar?q=perro` | búsqueda por nombre, descripción, tags o país |

Colombia tiene las mismas rutas bajo `/co`: `/co/fecha/20-julio`, `/co/calendario/julio`, `/co/buscar?q=maestro` y `/co/celebracion/<id>`.

## Modelo de datos

Cada archivo `data/celebraciones/MM.json` es un array de celebraciones de ese mes. Ejemplo real, de `09.json`:

```json
{
  "id": "dia-del-maestro",
  "nombre": "Día del Maestro",
  "fecha": { "dia": 11, "mes": 9 },
  "alcance": "argentina",
  "categoria": "educacion",
  "descripcion": "Homenaje a Domingo Faustino Sarmiento en el aniversario de su fallecimiento en 1888.",
  "fuentes": [
    {
      "nombre": "Argentina.gob.ar - ¿Por qué se celebra el Día del Maestro?",
      "url": "https://www.argentina.gob.ar/noticias/por-que-se-celebra-el-dia-del-maestro",
      "tipo": "institucional"
    }
  ],
  "emoji": "🍎",
  "tags": ["docente", "sarmiento"],
  "destacado": true,
  "verificadoEn": "2026-09-11"
}
```

### Campos

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | slug kebab-case sin tildes, único en todo el sitio |
| `nombre` | string | sí | 3 a 140 caracteres |
| `fecha` | fija o móvil | sí | ver abajo |
| `alcance` | `"argentina"` \| `"colombia"` \| `"internacional"` \| `"otro-pais"` | sí | `otro-pais` es para los países que no tienen vista propia |
| `pais` | string | sólo si `alcance = "otro-pais"` | ej. "Chile"; no puede ser Argentina ni Colombia, que usan su propio alcance |
| `categoria` | una de 15 categorías | sí | `profesion`, `salud`, `ambiente`, `educacion`, `cultura`, `animales`, `comida`, `religion`, `historia`, `deporte`, `tecnologia`, `ciencia`, `sociedad`, `derechos`, `familia` |
| `descripcion` | string | sí | una línea, 10 a 220 caracteres, termina en punto |
| `fuentes` | array de fuentes | sí, ≥1 | al menos una no debe ser `secundaria` |
| `emoji` | string | no | |
| `tags` | array de strings | no | sinónimos para la búsqueda |
| `destacado` | boolean | no | sube al tope del bloque en la lista del día |
| `verificadoEn` | string `YYYY-MM-DD` | sí | fecha en que se abrió la fuente y se confirmó el dato |

Cada fuente tiene `nombre`, `url` y `tipo`, con `tipo` uno de:

| Tipo | Qué es |
|---|---|
| `institucional` | Estado (nacional, provincial, municipal) u organismo internacional oficial (ONU, UNESCO, OMS, FAO, OIT) |
| `asociacion` | colegio o asociación profesional oficial (ej. un colegio de abogados, una federación deportiva) |
| `normativa` | ley, decreto o resolución publicada en el Boletín Oficial o InfoLEG |
| `secundaria` | cualquier otra fuente (Wikipedia, notas de prensa). Nunca puede ser la única fuente de una celebración |

### Fechas fijas y móviles

Una fecha fija es `{ "dia": 11, "mes": 9 }`.

Una fecha móvil se define por regla, no por día del mes: `{ "mes": 10, "ordinal": 3, "diaSemana": 0 }` es "el tercer domingo de octubre", que es como se define el Día de la Madre en Argentina. `diaSemana` va de 0 (domingo) a 6 (sábado). `ordinal` es 1 a 4, o `-1` para "el último de ese día de la semana en el mes" (por ejemplo, el último lunes). El día calendario real se recalcula cada año.

## Cómo editar y agregar fechas

**A mano:** abrí el `MM.json` del mes que corresponda y agregá el objeto en el lugar que le toca (las fechas fijas van ordenadas por día; las móviles, al final del archivo). Después corré:

```bash
pnpm data:validate
pnpm data:links 09   # o el mes que tocaste
```

**Con la CLI**, que valida y ordena por vos:

```bash
pnpm data:add
```

Te va a preguntar nombre, tipo de fecha, alcance (y país si corresponde), categoría, descripción, emoji, tags, si es destacada, y las fuentes (con un mínimo de una no secundaria). Sugiere un id a partir del nombre, que podés editar. Al final valida contra el schema, inserta ordenado en el `MM.json` que corresponde y te recuerda correr `data:validate` y `data:links`.

También funciona sin preguntas interactivas, para scripts o agentes:

```bash
pnpm data:add --json '{"nombre":"Día del Fotógrafo","fecha":{"dia":21,"mes":9},"alcance":"argentina","categoria":"profesion","descripcion":"...","fuentes":[{"nombre":"...","url":"https://...","tipo":"institucional"}]}'
# o con un archivo
pnpm data:add --file nueva-celebracion.json
```

En modo no interactivo, si no mandás `id` se genera del `nombre`, y si no mandás `verificadoEn` se usa la fecha de hoy en Argentina.

### Regla de fuentes

Toda celebración necesita al menos una fuente `institucional`, `asociacion` o `normativa` (en Colombia, por ejemplo, la Secretaría del Senado, la Función Pública o el sitio de una entidad oficial). Wikipedia y notas de prensa sólo sirven como fuente `secundaria`, es decir, además de una de las otras, nunca solas. Sin una fuente confiable, la celebración no entra.

### Qué no entra

- Feriados que no se llaman "Día de/del X" (un feriado puente, un feriado trasladable sin nombre propio).
- Acontecimientos históricos que no son una celebración anual con nombre propio (una batalla, un aniversario institucional que no se conmemora activamente).

## Efemérides

Las efemérides viven en `data/efemerides/MM.json` y las genera `pnpm data:efemerides` a partir del feed "On this day" de Wikimedia para Wikipedia en español (`api.wikimedia.org/feed/v1/wikipedia/es/onthisday`). Es una carga de todo el año de una sola vez (unos 12 minutos); no hay que volver a correrla cada mes. Se vuelve a correr sólo para refrescar el contenido con lo que Wikipedia haya agregado, y reemplaza los doce archivos. Para sumar sólo las colombianas, `pnpm data:efemerides --solo colombia` (o `pnpm data:efemerides 7 --solo colombia` para un mes). Ese modo no regenera nada: agrega las colombianas que todavía no están, conserva las que ya están y convierte las efemérides internacionales que coinciden con una colombiana en `colombia` con `tambienInternacional`, para que sigan viéndose en Argentina. Todo lo demás queda como está.

Cada efeméride tiene esta forma:

```json
{
  "id": "1945-nace-tanguito-musico-y-compositor",
  "fecha": { "dia": 16, "mes": 9 },
  "anio": 1945,
  "tipo": "nacimiento",
  "texto": "Nace Tanguito, músico y compositor argentino (f. 1972).",
  "alcance": "argentina",
  "fuentes": [{ "nombre": "Wikipedia (Tanguito)", "url": "https://es.wikipedia.org/wiki/Tanguito", "tipo": "secundaria" }],
  "verificadoEn": "2026-09-16"
}
```

`tipo` es `acontecimiento`, `nacimiento` o `fallecimiento`; `alcance` es `argentina` (el texto menciona Argentina, Buenos Aires o un gentilicio argentino), `colombia` (lo mismo para Colombia) o `internacional`. Una efeméride colombiana que además es un hecho de alcance mundial lleva `"tambienInternacional": true`, y entonces también se muestra en la vista de Argentina, dentro del bloque internacional; las demás colombianas sólo se ven en `/co`, y las argentinas sólo en `/`. A diferencia de las celebraciones, acá Wikipedia alcanza como única fuente. Los nacimientos y fallecimientos enlazan al artículo de la persona; los acontecimientos enlazan a la página del día en Wikipedia (por ejemplo `16_de_septiembre#Acontecimientos`), que es de donde sale el texto. `verificadoEn` es la fecha de la importación.

Qué elige el script por día (cupos en `scripts/importar-efemerides.ts`):

- Argentina y Colombia: hasta 4 acontecimientos, 3 nacimientos y 2 fallecimientos cada una.
- Internacional: hasta 3 acontecimientos, 2 nacimientos (anteriores a 1990) y 2 fallecimientos.
- Los acontecimientos se ordenan por cuántos artículos de Wikipedia enlazan. Las personas, por la cantidad de ediciones de Wikipedia en las que existe su artículo (Wikidata); las personas internacionales necesitan al menos 8 y los deportistas al menos 15, para que no entren cientos de futbolistas.
- El texto es la primera oración del feed, con "Nace" o "Muere" adelante para personas. Los acontecimientos se cortan en la última oración completa antes de los 300 caracteres.

## Fuentes que usamos

Dominios de referencia para buscar fuentes nuevas: `argentina.gob.ar`, `funcionpublica.gov.co`, `secretariasenado.gov.co`, `bogota.gov.co`, `un.org`, `unesco.org`, `who.int`, `fao.org`, `boletinoficial.gob.ar`, `infoleg.gob.ar`, sitios de gobiernos provinciales y municipales, y las asociaciones o colegios profesionales de cada actividad. Cada entrada guarda en `verificadoEn` la fecha en que se abrió y confirmó esa fuente.

## Zona horaria

"Hoy" se calcula por país: `America/Argentina/Buenos_Aires` para `/` y `America/Bogota` para `/co`. Las dos homes se renderizan por request, así que siempre están actualizadas. Las páginas de `/fecha/[slug]` y `/co/fecha/[slug]` son estáticas pero se revalidan cada hora, y el rótulo "Hoy" se corrige además en el navegador para no depender de cuándo se generó la página. El pie de página dice "Zona horaria Argentina" o "Zona horaria Colombia" según la vista.

## Variables de entorno

`NEXT_PUBLIC_SITE_URL`: URL pública del sitio (ej. `https://que-se-celebra-hoy.vercel.app`), usada para el sitemap, el `robots.txt` y las URLs canónicas. Sin definirla, se usa `http://localhost:3000`.

## Deploy

Producción en Vercel: https://diadehoy.vercel.app (proyecto `diade`, scope `chakky-cardozos-projects`). Cada push a `main` en GitHub deploya solo. La variable `NEXT_PUBLIC_SITE_URL` de producción vale `https://diadehoy.vercel.app`. Para un deploy manual: `vercel --prod`.

## Cobertura de datos

- 629 celebraciones: 208 de Argentina, 79 de Colombia, 269 internacionales y 73 de otros países.
- 7255 efemérides: 2954 argentinas, 1777 colombianas y 2524 internacionales (35 de las colombianas también se muestran en Argentina, por ser hechos de alcance mundial).
- Efemérides argentinas e internacionales para los 366 días, con al menos una argentina por día (`pnpm test` lo verifica). Las colombianas cubren 365 días; el 29 de febrero no tiene.
- Los 366 días del año tienen al menos una celebración. Cuando Argentina y los organismos internacionales no tienen nada para una fecha, entra un "Día de X" de otro país con fuente oficial de ese país, marcado con `alcance: "otro-pais"` y su `pais`.
- Las 79 celebraciones colombianas son las que se pudieron confirmar con fuente oficial, y son 70 de fecha fija, repartidas en 62 días distintos porque varias comparten día, más 9 de fecha móvil; los otros días de `/co` muestran sólo lo internacional y lo de otros países, más las efemérides.
- Todas las fuentes se verifican con `pnpm data:links` (HTTP 200 al momento de la carga). Algunas leyes colombianas de `secretariasenado.gov.co` están cargadas con `http://` porque el `https` de ese sitio no conecta.

Celebraciones de Colombia por mes:

| Mes | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Celebraciones | 2 | 5 | 8 | 8 | 9 | 7 | 4 | 8 | 5 | 8 | 9 | 6 |

## Limitaciones conocidas

- Para países que no son Argentina ni Colombia no hay un calendario completo por país: están las fechas más conocidas de la región (Chile, Uruguay, Brasil, México, España, Estados Unidos, Bolivia) y las que cubren días sin celebración argentina o internacional.
- Colombia tiene menos celebraciones que Argentina: no se cargó nada sin fuente oficial confirmada, así que hay días sin una celebración colombiana.
- El 29 de febrero sólo existe en años bisiestos; el Día Mundial de las Enfermedades Poco Frecuentes está cargado el 28 y, como entrada aparte, el 29 para los bisiestos, porque la fuente lo fija en "el último día de febrero".
