import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { celebracionSchema } from "../src/lib/schema";
import { idsExistentes, insertarOrdenado, nombreArchivoMes, slugDeNombre } from "../src/lib/datos-edicion";
import { CATEGORIAS, TIPOS_FUENTE, type Categoria, type Celebracion, type Fuente } from "../src/types/celebracion";

function directorioDatos(): string {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--dir");
  if (idx !== -1 && args[idx + 1]) return path.resolve(args[idx + 1]);
  if (process.env.DATA_DIR) return path.resolve(process.env.DATA_DIR);
  return path.join(process.cwd(), "data", "celebraciones");
}

function argumentoDe(nombre: string): string | undefined {
  const args = process.argv.slice(2);
  const idx = args.indexOf(nombre);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function hoyISO(): string {
  const partes = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const anio = partes.find((p) => p.type === "year")?.value;
  const mes = partes.find((p) => p.type === "month")?.value;
  const dia = partes.find((p) => p.type === "day")?.value;
  return `${anio}-${mes}-${dia}`;
}

function mostrarErrores(errores: { path: PropertyKey[]; message: string }[]): void {
  console.error("✗ la celebración no es válida:");
  for (const e of errores) console.error(`   ${e.path.join(".")}: ${e.message}`);
}

function leerTodosLosArchivos(dir: string): Celebracion[][] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((nombre) => nombre.endsWith(".json"))
    .map((nombre) => JSON.parse(fs.readFileSync(path.join(dir, nombre), "utf8")) as Celebracion[]);
}

function insertarYGuardar(dir: string, candidata: unknown): number {
  const parsed = celebracionSchema.safeParse(candidata);
  if (!parsed.success) {
    mostrarErrores(parsed.error.issues);
    return 1;
  }
  const celebracion = parsed.data as unknown as Celebracion;
  const archivo = nombreArchivoMes(celebracion.fecha.mes);
  const ruta = path.join(dir, archivo);
  const existentes: Celebracion[] = fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta, "utf8")) : [];

  if (idsExistentes(leerTodosLosArchivos(dir)).has(celebracion.id)) {
    console.error(`✗ ya existe una celebración con id "${celebracion.id}" en los datos`);
    return 1;
  }

  const actualizada = insertarOrdenado(existentes, celebracion);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ruta, `${JSON.stringify(actualizada, null, 2)}\n`);
  console.log(`Agregada ${celebracion.id} en ${archivo}. Corré pnpm data:validate y pnpm data:links ${archivo.slice(0, 2)}`);
  return 0;
}

async function modoNoInteractivo(): Promise<number> {
  const dir = directorioDatos();
  const jsonArg = argumentoDe("--json");
  const fileArg = argumentoDe("--file");
  const raw = jsonArg ?? (fileArg ? fs.readFileSync(path.resolve(fileArg), "utf8") : undefined);
  if (!raw) {
    console.error("uso: pnpm data:add --json '<objeto>' | --file <ruta.json> [--dir <dir>]");
    return 2;
  }
  const objeto = JSON.parse(raw) as Record<string, unknown>;
  const candidata = {
    verificadoEn: hoyISO(),
    ...objeto,
    id: (objeto.id as string | undefined) ?? slugDeNombre(String(objeto.nombre ?? "")),
  };
  return insertarYGuardar(dir, candidata);
}

async function preguntarLista<T extends string>(
  rl: readline.Interface,
  titulo: string,
  opciones: readonly T[],
): Promise<T> {
  console.log(titulo);
  opciones.forEach((op, i) => console.log(`  ${i + 1}. ${op}`));
  while (true) {
    const respuesta = await rl.question("> ");
    const indice = Number(respuesta.trim()) - 1;
    if (indice >= 0 && indice < opciones.length) return opciones[indice];
    console.log("Opción inválida, probá de nuevo.");
  }
}

async function preguntarFuentes(rl: readline.Interface): Promise<Fuente[]> {
  const fuentes: Fuente[] = [];
  console.log("Fuentes (mínimo una institucional/asociacion/normativa). Nombre vacío para terminar.");
  while (true) {
    const nombre = await rl.question(`  Fuente #${fuentes.length + 1} - nombre (o enter para terminar): `);
    if (!nombre.trim()) {
      const tieneNoSecundaria = fuentes.some((f) => f.tipo !== "secundaria");
      if (fuentes.length === 0 || !tieneNoSecundaria) {
        console.log("Necesitás al menos una fuente institucional, asociacion o normativa.");
        continue;
      }
      break;
    }
    const url = await rl.question("  url: ");
    const tipo = await preguntarLista(rl, "  tipo:", TIPOS_FUENTE);
    fuentes.push({ nombre: nombre.trim(), url: url.trim(), tipo });
  }
  return fuentes;
}

async function modoInteractivo(): Promise<number> {
  const dir = directorioDatos();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const nombre = (await rl.question("Nombre (ej. Día del Fotógrafo): ")).trim();
    const tipoFecha = await preguntarLista(rl, "Tipo de fecha:", ["fija", "móvil"] as const);
    const fecha =
      tipoFecha === "fija"
        ? {
            dia: Number((await rl.question("  día (1-31): ")).trim()),
            mes: Number((await rl.question("  mes (1-12): ")).trim()),
          }
        : {
            mes: Number((await rl.question("  mes (1-12): ")).trim()),
            ordinal: Number((await rl.question("  ordinal (1, 2, 3, 4 o -1 para último): ")).trim()) as 1 | 2 | 3 | 4 | -1,
            diaSemana: Number(
              (await rl.question("  día de la semana (0=domingo … 6=sábado): ")).trim(),
            ) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          };

    const alcance = await preguntarLista(rl, "Alcance:", ["argentina", "internacional", "otro-pais"] as const);
    const pais = alcance === "otro-pais" ? (await rl.question("  país: ")).trim() : undefined;

    const categoria: Categoria = await preguntarLista(rl, "Categoría:", CATEGORIAS);
    const descripcion = (await rl.question("Descripción (una línea, termina en punto): ")).trim();
    const emoji = (await rl.question("Emoji (opcional): ")).trim();
    const tagsRaw = (await rl.question("Tags separados por coma (opcional): ")).trim();
    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : undefined;
    const destacadoRaw = (await rl.question("¿Destacado? (s/N): ")).trim().toLowerCase();
    const destacado = destacadoRaw === "s" || destacadoRaw === "si" || destacadoRaw === "sí";

    const fuentes = await preguntarFuentes(rl);

    const idSugerido = slugDeNombre(nombre);
    const idElegido = (await rl.question(`Id (enter para usar "${idSugerido}"): `)).trim();
    const id = idElegido || idSugerido;

    const candidata: Record<string, unknown> = {
      id,
      nombre,
      fecha,
      alcance,
      categoria,
      descripcion,
      fuentes,
      verificadoEn: hoyISO(),
    };
    if (pais) candidata.pais = pais;
    if (emoji) candidata.emoji = emoji;
    if (tags && tags.length > 0) candidata.tags = tags;
    if (destacado) candidata.destacado = true;

    return insertarYGuardar(dir, candidata);
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const esNoInteractivo = args.includes("--json") || args.includes("--file");
  const codigo = esNoInteractivo ? await modoNoInteractivo() : await modoInteractivo();
  process.exit(codigo);
}

void main();
