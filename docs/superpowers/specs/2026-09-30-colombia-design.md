# Colombia como segundo país — diseño

Fecha: 2026-09-30

## Objetivo

Que una persona en Colombia use el sitio igual que hoy lo usa una en Argentina: sus días nacionales, profesionales y populares primero, "hoy" en su hora, y sus efemérides. Argentina no cambia para quien ya la usa.

Éxito:

- `/co` muestra el día de hoy según Bogotá, con el bloque Colombia arriba.
- Todas las URLs actuales siguen respondiendo lo mismo que hoy.
- Cada celebración colombiana tiene al menos una fuente institucional, de asociación o normativa, abierta y verificada.

## Fuera de alcance

- Recordar el país elegido (cookie, localStorage) o detectarlo por ubicación.
- Un tercer país.
- Un color de acento distinto para Colombia.
- Feriados colombianos que no se llamen "Día de/del X" (misma regla Q8 de `docs/diseno.md`).

## 1. Países

Archivo nuevo `src/lib/paises.ts`, única fuente de verdad de lo que hoy está hardcodeado para Argentina.

```ts
export const PAISES = {
  ar: { codigo: "ar", alcance: "argentina", nombre: "Argentina", bandera: "🇦🇷", zona: "America/Argentina/Buenos_Aires", locale: "es_AR", prefijo: "", ciudad: "Buenos Aires" },
  co: { codigo: "co", alcance: "colombia", nombre: "Colombia", bandera: "🇨🇴", zona: "America/Bogota", locale: "es_CO", prefijo: "/co", ciudad: "Bogotá" },
} as const;
export type CodigoPais = keyof typeof PAISES;
```

Funciones:

- `rutaDePais(pais, ruta)`: antepone el prefijo (`rutaDePais("co", "/buscar")` → `/co/buscar`; `rutaDePais("co", "/")` → `/co`).
- `paisDeRuta(pathname)`: `co` si el pathname es `/co` o empieza con `/co/`; si no, `ar`.
- `rutaEnOtroPais(pathname, destino)`: la misma página en el otro país (`/co/fecha/11-septiembre` ↔ `/fecha/11-septiembre`).

`hoyEnArgentina()` pasa a ser `hoyEn(pais, ahora?)` en `src/lib/fechas.ts`, con la zona del país. Se reemplazan todos los usos.

## 2. Modelo de datos

- `ALCANCES` pasa a `["argentina", "colombia", "internacional", "otro-pais"]`.
- `ALCANCES_EFEMERIDE` pasa a `["argentina", "colombia", "internacional"]`.
- `Efemeride` suma el campo opcional `tambienInternacional: true`, válido solo en efemérides de un país.
- Las celebraciones colombianas van en los mismos `data/celebraciones/MM.json` con `alcance: "colombia"`, sin `pais`.
- Hoy no hay entradas `otro-pais` con `pais: "Colombia"`; el validador rechaza `otro-pais` con `pais` igual al nombre de un país de `PAISES`, para que no aparezcan por los dos caminos.

## 3. Orden y agrupación según el país que mira

Un país es "local" para la vista y el otro es "vecino".

- `celebracionesDeFecha(fecha, anio, pais)` ordena: local → internacional → resto (otro-pais y vecino juntos), destacados primero dentro de cada bloque, después alfabético.
- `agruparPorAlcance(lista, pais)` devuelve `{ local, internacional, otros }`. El vecino cae en `otros` y se muestra con su bandera y nombre, igual que un `otro-pais`.
- `contarPorDia(mes, anio, pais)` devuelve `{ total, local, internacional, otros }`.
- `ordenarPorRelevancia` (SEO) y el orden de `buscar` reciben el país y usan la misma prioridad.
- `proximosDestacados` excluye los destacados del vecino: en `/co` no se anuncia el Día de la Bandera argentina como próximo destacado.
- Efemérides: `efemeridesDeFecha(fecha, pais)` devuelve las del país local y las internacionales, local primero. Las del vecino no se muestran, salvo las marcadas `tambienInternacional: true`, que aparecen dentro del bloque Internacional.

Helper `etiquetaDeAlcance(celebracion)` → `{ bandera, texto }` para argentina, colombia, internacional y otro-pais; reemplaza los `if alcance === "argentina"` repetidos en `calendario/[mes]`, `celebracion/[id]`, `Buscador`, `ListaCelebraciones` y `EmojiTile`. `BANDERAS_PAIS` suma Colombia y Argentina.

## 4. Rutas

| Argentina (sin cambios) | Colombia |
|---|---|
| `/` | `/co` |
| `/fecha/[slug]` | `/co/fecha/[slug]` |
| `/calendario`, `/calendario/[mes]` | `/co/calendario`, `/co/calendario/[mes]` |
| `/buscar` | `/co/buscar` |
| `/celebracion/[id]` | `/co/celebracion/[id]` |

- El contenido de cada página se mueve a un componente compartido que recibe `pais`; los archivos de ruta de cada país quedan como envoltorios finos. La forma exacta de los archivos (carpeta `co/` o segmento dinámico) se decide en el plan, después de leer la documentación de Next 16 que trae `node_modules/next/dist/docs/`.
- `/co/celebracion/[id]` declara canonical a `/celebracion/[id]`: una sola página indexada por celebración.
- Las demás páginas de `/co` tienen su propio canonical, `openGraph.locale` `es_CO` y textos con "Colombia" y "horario de Bogotá".
- `sitemap.ts` suma `/co`, `/co/buscar`, los 12 `/co/calendario/[mes]` y las 366 `/co/fecha/[slug]`. No suma `/co/celebracion/[id]`.

## 5. Selector y navegación

- `SelectorPais` (cliente) en el header: `🇦🇷 | 🇨🇴`, el actual marcado con `aria-current`. Cada opción es un link a `rutaEnOtroPais(pathname, destino)`.
- Header, `TabBar`, `NavegacionDia`, `SelectorFecha`, `SelectorMes`, `CalendarioMes`, `ProximosDestacados`, `CelebracionItem` y `Buscador` arman sus links con `rutaDePais`, para no salir del país al navegar.
- El footer dice la zona horaria del país actual.
- El filtro de alcance en `/buscar` muestra: país local, Internacional, Otros países. "Otros países" incluye al vecino.

## 6. Datos: celebraciones de Colombia

- Meta: alrededor de 150 entradas; nacionales, profesionales y populares.
- Fuentes aceptadas: sitios `gov.co` (ministerios, Presidencia, Función Pública, SUIN-Juriscol), leyes y decretos, colegios y asociaciones profesionales oficiales. Wikipedia solo como `secundaria` y nunca sola.
- Cada fuente se abre antes de cargar la entrada; `verificadoEn` es la fecha real de esa verificación. Sin fuente confiable, no entra.
- Si un día internacional ya existe como `internacional`, no se duplica como colombiano salvo que Colombia lo celebre en otra fecha o con otra norma propia.
- Fechas móviles con la regla existente `{ mes, ordinal, diaSemana }`. Una fecha que no entre en esa regla (por ejemplo, un feriado trasladado por la Ley Emiliani) se carga con su fecha fija de origen y la descripción lo aclara; no se extiende el modelo de fechas.
- Un día sin entrada colombiana muestra solo Internacional y Otros países; no se inventa contenido para llenar.

## 7. Datos: efemérides de Colombia

- `scripts/importar-efemerides.ts` suma un detector de Colombia (`colombian[oa]s`, `Colombia`, `Bogotá`, `Cali`, `Cartagena de Indias`, `Barranquilla`, `Nueva Granada`; un `Medellín` suelto no es término porque coincide con un pueblo español y con un apellido, y "Medellín, Colombia" ya se detecta por el nombre del país) y cupos iguales a los de Argentina (4/3/2).
- Un texto que menciona los dos países se clasifica como argentina (no cambia lo ya importado).
- Modo nuevo `--solo colombia`: trae el feed, conserva tal cual las efemérides existentes de cada archivo y agrega solo las colombianas. Las que hoy están como `internacional` y el detector marca como colombianas se reclasifican a `colombia` con `tambienInternacional: true`, así la vista de Argentina las sigue mostrando en Internacional y no pierde nada de lo que muestra hoy; el resto no se toca.
- Sin `--solo`, el script sigue regenerando todo como hoy.

## 8. Textos

- `layout.tsx`: la descripción general deja de decir solo "Argentina" en las páginas de `/co`.
- `README.md` y `docs/diseno.md`: se actualizan conteos, el modelo (`alcance`), las rutas y la regla de orden.

## 9. Pruebas

Primero el test, después el código:

- `paises`: `rutaDePais`, `paisDeRuta`, `rutaEnOtroPais` (incluye `/co` exacto, `/co/…`, y una ruta que empieza con `/co` pero no es el prefijo, como `/comida`).
- `fechas`: `hoyEn("co")` con `2026-09-12T03:30Z` da 11/9 (en Buenos Aires ya es 12/9).
- `celebraciones`: orden y agrupación para `ar` y para `co`; el vecino cae en `otros`; `contarPorDia` por país.
- `efemerides`: en `co` no aparecen las argentinas y viceversa.
- `proximos`: excluye destacados del vecino.
- `buscar` y `seo`: prioridad según país.
- `schema`: acepta `alcance: "colombia"`; rechaza `otro-pais` con `pais: "Colombia"` o `"Argentina"`.
- `datos`: los 12 archivos validan; hay entradas colombianas; ids únicos.

Cierre: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm data:validate`, `pnpm data:links`, `pnpm build`, y una pasada en el navegador por `/`, `/co`, una fecha, un mes, el buscador y el selector en ambos sentidos.
