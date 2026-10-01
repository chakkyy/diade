import fs from "node:fs";
import path from "node:path";
import { archivoEfemeridesSchema } from "../src/lib/schema";
import { MESES, diasDelMes, hoyEn } from "../src/lib/fechas";
import { alcanceDeTexto, fusionarPais, type AlcancePais } from "../src/lib/efemerides-importacion";
import { CODIGOS_PAIS, PAISES, type CodigoPais } from "../src/lib/paises";
import type { Efemeride, TipoEfemeride } from "../src/types/efemeride";

const API = "https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday";
const TIPOS_FEED = ["events", "births", "deaths"] as const;
const UA = "que-se-celebra-hoy/0.1 (https://diadehoy.vercel.app)";
const CONCURRENCIA = 3;
const REINTENTOS = 5;
const ANIO_BISIESTO_REFERENCIA = 2024;
const LARGO_MAXIMO_TEXTO = 300;
const LARGO_MINIMO_TEXTO = 12;
const SEPARADOR_ORACIONES = /(?<=[a-záéíóúñ0-9)»"][.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡«"(])/;

const CUPO_PAIS: Record<TipoEfemeride, number> = { acontecimiento: 4, nacimiento: 3, fallecimiento: 2 };
const CUPO_INTERNACIONAL: Record<TipoEfemeride, number> = { acontecimiento: 3, nacimiento: 2, fallecimiento: 2 };

const CUPOS = {
  ...(Object.fromEntries(CODIGOS_PAIS.map((codigo) => [PAISES[codigo].alcance, CUPO_PAIS])) as Record<
    AlcancePais,
    Record<TipoEfemeride, number>
  >),
  internacional: CUPO_INTERNACIONAL,
} satisfies Record<Efemeride["alcance"], Record<TipoEfemeride, number>>;

const DEPORTISTA =
  /futbolist|baloncestist|basquetbolist|ciclist|piloto|jugador|luchador|tenist|nadador|atleta|boxeador|golfist|voleibolist|balonmanist|rugbist|beisbolist|hockey|patinador|esgrimist|remero|gimnast|judoca|yudoca|surfist|esquiador|corredor|velocist|maratonist|clavadist|halterófil|pesist|karateca|taekwondist|arquero|delantero|defensor|centrocampist|entrenador/i;
const ANIO_TOPE_NACIMIENTO_INTERNACIONAL = 1990;
const WIKIDATA = "https://www.wikidata.org/w/api.php";
const TAMANIO_LOTE_WIKIDATA = 50;
const MINIMO_EDICIONES_DEPORTISTA = 15;
const MINIMO_EDICIONES_PERSONA_INTERNACIONAL = 8;

interface ItemFeed {
  year?: number;
  text: string;
  pages?: {
    title?: string;
    normalizedtitle?: string;
    extract?: string;
    wikibase_item?: string;
    content_urls?: { desktop?: { page?: string } };
  }[];
}

interface Feed {
  events?: ItemFeed[];
  births?: ItemFeed[];
  deaths?: ItemFeed[];
}

interface Candidato {
  tipo: TipoEfemeride;
  anio: number;
  texto: string;
  alcance: Efemeride["alcance"];
  puntaje: number;
  deportista: boolean;
  qid: string | null;
  fuente: Efemeride["fuentes"][number];
}

function dormir(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function traerJson<T>(url: string): Promise<T> {
  let ultimoError: unknown;
  for (let intento = 1; intento <= REINTENTOS; intento++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
      if (res.ok) return (await res.json()) as T;
      ultimoError = new Error(`HTTP ${res.status}`);
      if (res.status < 500 && res.status !== 429) break;
    } catch (e) {
      ultimoError = e;
    }
    await dormir(1500 * intento);
  }
  throw new Error(`${url}: ${ultimoError instanceof Error ? ultimoError.message : String(ultimoError)}`);
}

async function traerDia(mes: number, dia: number): Promise<Feed> {
  const sufijo = `${String(mes).padStart(2, "0")}/${String(dia).padStart(2, "0")}`;
  const feed: Feed = {};
  for (const tipo of TIPOS_FEED) {
    const parcial = await traerJson<Feed>(`${API}/${tipo}/${sufijo}`);
    feed[tipo] = parcial[tipo] ?? [];
  }
  return feed;
}

function primeraOracion(texto: string): string | null {
  const limpio = texto.replace(/\s+/g, " ").replace(/\[\d+\]/g, "").trim();
  if (limpio.length <= LARGO_MAXIMO_TEXTO) return limpio;
  const partes = limpio.split(SEPARADOR_ORACIONES);
  let acumulado = "";
  for (const parte of partes) {
    const siguiente = acumulado ? `${acumulado} ${parte}` : parte;
    if (siguiente.length > LARGO_MAXIMO_TEXTO) break;
    acumulado = siguiente;
  }
  return acumulado || null;
}

function soloPrimeraOracion(texto: string): string {
  return texto.replace(/\s+/g, " ").trim().split(SEPARADOR_ORACIONES)[0];
}

function normalizarTexto(tipo: TipoEfemeride, crudo: string): string | null {
  const oracion = tipo === "acontecimiento" ? primeraOracion(crudo) : soloPrimeraOracion(crudo);
  if (!oracion || oracion.length > LARGO_MAXIMO_TEXTO || oracion.length < LARGO_MINIMO_TEXTO) return null;
  let texto = oracion;
  if (tipo === "nacimiento") texto = `Nace ${texto}`;
  else if (tipo === "fallecimiento") texto = `Muere ${texto}`;
  else texto = texto.charAt(0).toUpperCase() + texto.slice(1);
  if (!/[.!?»")]$/.test(texto)) texto = `${texto}.`;
  return texto;
}

const PAGINA_GENERICA = /^(Anexo:|Siglo |Años |Década |\d{1,4}( a\. C\.)?$)/;

function paginaDelDia(mes: number, dia: number, ancla: string): Efemeride["fuentes"][number] {
  const nombreMes = MESES[mes - 1];
  return {
    nombre: `Wikipedia (${dia} de ${nombreMes})`,
    url: `https://es.wikipedia.org/wiki/${dia}_de_${nombreMes}#${ancla}`,
    tipo: "secundaria",
  };
}

function fuenteDe(item: ItemFeed, tipo: TipoEfemeride, mes: number, dia: number): Efemeride["fuentes"][number] {
  if (tipo === "acontecimiento") return paginaDelDia(mes, dia, "Acontecimientos");
  const pagina = item.pages?.find(
    (p) => p.content_urls?.desktop?.page && !PAGINA_GENERICA.test(p.normalizedtitle ?? p.title?.replace(/_/g, " ") ?? ""),
  );
  if (pagina?.content_urls?.desktop?.page) {
    const titulo = pagina.normalizedtitle ?? pagina.title?.replace(/_/g, " ") ?? "artículo";
    return { nombre: `Wikipedia (${titulo})`, url: pagina.content_urls.desktop.page, tipo: "secundaria" };
  }
  return paginaDelDia(mes, dia, tipo === "nacimiento" ? "Nacimientos" : "Fallecimientos");
}

function puntajeAcontecimiento(item: ItemFeed): number {
  const paginas = item.pages?.length ?? 0;
  const extracto = item.pages?.[0]?.extract?.length ?? 0;
  return paginas * 1000 + extracto;
}

async function traerEdiciones(qids: string[]): Promise<Map<string, number>> {
  const ediciones = new Map<string, number>();
  const lotes: string[][] = [];
  for (let i = 0; i < qids.length; i += TAMANIO_LOTE_WIKIDATA) lotes.push(qids.slice(i, i + TAMANIO_LOTE_WIKIDATA));
  let cursor = 0;
  async function worker() {
    while (cursor < lotes.length) {
      const lote = lotes[cursor++];
      const url = `${WIKIDATA}?action=wbgetentities&ids=${lote.join("|")}&props=sitelinks&format=json`;
      const data = await traerJson<{ entities?: Record<string, { sitelinks?: Record<string, unknown> }> }>(url);
      for (const [qid, entidad] of Object.entries(data.entities ?? {})) {
        ediciones.set(qid, Object.keys(entidad.sitelinks ?? {}).length);
      }
      await dormir(100);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCIA }, worker));
  return ediciones;
}

function candidatosDe(feed: Feed, mes: number, dia: number, anioActual: number): Candidato[] {
  const grupos: [TipoEfemeride, ItemFeed[] | undefined][] = [
    ["acontecimiento", feed.events],
    ["nacimiento", feed.births],
    ["fallecimiento", feed.deaths],
  ];
  const candidatos: Candidato[] = [];
  for (const [tipo, items] of grupos) {
    for (const item of items ?? []) {
      if (typeof item.year !== "number" || item.year > anioActual) continue;
      const alcance = alcanceDeTexto(item.text);
      const esPersona = tipo !== "acontecimiento";
      if (tipo === "nacimiento" && alcance === "internacional" && item.year > ANIO_TOPE_NACIMIENTO_INTERNACIONAL) continue;
      const texto = normalizarTexto(tipo, item.text);
      if (!texto) continue;
      candidatos.push({
        tipo,
        anio: item.year,
        texto,
        alcance,
        puntaje: esPersona ? 0 : puntajeAcontecimiento(item),
        deportista: esPersona && DEPORTISTA.test(item.text),
        qid: esPersona ? (item.pages?.[0]?.wikibase_item ?? null) : null,
        fuente: fuenteDe(item, tipo, mes, dia),
      });
    }
  }
  return candidatos;
}

function pasaFiltroPersona(c: Candidato, ediciones: number): boolean {
  if (c.tipo === "acontecimiento") return true;
  if (c.deportista && ediciones < MINIMO_EDICIONES_DEPORTISTA) return false;
  if (c.alcance === "internacional" && ediciones < MINIMO_EDICIONES_PERSONA_INTERNACIONAL) return false;
  return true;
}

function seleccionar(candidatos: Candidato[], alcances: readonly Efemeride["alcance"][]): Candidato[] {
  const elegidos: Candidato[] = [];
  for (const alcance of alcances) {
    for (const tipo of ["acontecimiento", "nacimiento", "fallecimiento"] as const) {
      const cupo = CUPOS[alcance][tipo];
      const bucket = candidatos
        .filter((c) => c.alcance === alcance && c.tipo === tipo)
        .sort((a, b) => b.puntaje - a.puntaje || a.anio - b.anio);
      elegidos.push(...bucket.slice(0, cupo));
    }
  }
  return elegidos;
}

function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 6)
    .join("-");
}

function idUnico(base: string, usados: Set<string>): string {
  let id = base;
  let n = 2;
  while (usados.has(id)) id = `${base}-${n++}`;
  usados.add(id);
  return id;
}

async function importarMes(
  mes: number,
  hoy: string,
  anioActual: number,
  usados: Set<string>,
  alcances: readonly Efemeride["alcance"][],
): Promise<Efemeride[]> {
  const dias = diasDelMes(mes, ANIO_BISIESTO_REFERENCIA);
  const porDia = new Map<number, Candidato[]>();
  let cursor = 1;
  async function worker() {
    while (cursor <= dias) {
      const dia = cursor++;
      const feed = await traerDia(mes, dia);
      porDia.set(dia, candidatosDe(feed, mes, dia, anioActual));
      await dormir(200);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCIA }, worker));

  const qids = [...new Set([...porDia.values()].flat().map((c) => c.qid).filter((q): q is string => q !== null))];
  const ediciones = await traerEdiciones(qids);
  for (const [dia, candidatos] of porDia) {
    const filtrados = candidatos.filter((c) => pasaFiltroPersona(c, c.qid ? (ediciones.get(c.qid) ?? 0) : 0));
    for (const c of filtrados) {
      if (c.tipo !== "acontecimiento") c.puntaje = c.qid ? (ediciones.get(c.qid) ?? 0) : 0;
    }
    porDia.set(dia, seleccionar(filtrados, alcances));
  }

  const efemerides: Efemeride[] = [];
  for (let dia = 1; dia <= dias; dia++) {
    const elegidos = (porDia.get(dia) ?? []).sort((a, b) => a.anio - b.anio);
    for (const c of elegidos) {
      const anioSlug = c.anio < 0 ? `${Math.abs(c.anio)}ac` : String(c.anio);
      efemerides.push({
        id: idUnico(`${anioSlug}-${slug(c.texto)}`, usados),
        fecha: { dia, mes },
        anio: c.anio,
        tipo: c.tipo,
        texto: c.texto,
        alcance: c.alcance,
        fuentes: [c.fuente],
        verificadoEn: hoy,
      });
    }
  }
  return efemerides;
}

const ALCANCES_COMPLETOS: readonly Efemeride["alcance"][] = [...CODIGOS_PAIS.map((codigo) => PAISES[codigo].alcance), "internacional"];
const USO = `uso: pnpm data:efemerides [MM] [--solo ${CODIGOS_PAIS.map((codigo) => PAISES[codigo].alcance).join("|")}]`;

function paisDeArgumento(valor: string | undefined): CodigoPais | null {
  if (valor === undefined) return null;
  return CODIGOS_PAIS.find((codigo) => codigo === valor || PAISES[codigo].alcance === valor) ?? null;
}

function leerArgumentos(): { soloMes: number | null; soloPais: CodigoPais | null } {
  const args = process.argv.slice(2);
  let soloPais: CodigoPais | null = null;
  const posicionales: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--solo") {
      soloPais = paisDeArgumento(args[i + 1]);
      if (soloPais === null) {
        console.error(USO);
        process.exit(1);
      }
      i++;
    } else if (args[i].startsWith("--")) {
      console.error(USO);
      process.exit(1);
    } else {
      posicionales.push(args[i]);
    }
  }
  const soloMes = posicionales[0] ? Number(posicionales[0]) : null;
  if (soloMes !== null && (!Number.isInteger(soloMes) || soloMes < 1 || soloMes > 12)) {
    console.error(USO);
    process.exit(1);
  }
  return { soloMes, soloPais };
}

function nombreArchivo(mes: number): string {
  return `${String(mes).padStart(2, "0")}.json`;
}

function leerMes(dir: string, mes: number): Efemeride[] {
  const archivo = path.join(dir, nombreArchivo(mes));
  if (!fs.existsSync(archivo)) return [];
  return archivoEfemeridesSchema.parse(JSON.parse(fs.readFileSync(archivo, "utf8")));
}

async function main() {
  const { soloMes, soloPais } = leerArgumentos();
  const meses = soloMes ? [soloMes] : Array.from({ length: 12 }, (_, i) => i + 1);
  const dir = path.join(process.cwd(), "data", "efemerides");
  fs.mkdirSync(dir, { recursive: true });
  const hoyArg = hoyEn("ar");
  const hoy = `${hoyArg.anio}-${String(hoyArg.mes).padStart(2, "0")}-${String(hoyArg.dia).padStart(2, "0")}`;
  const usados = new Set<string>();
  let total = 0;

  if (soloPais) {
    for (let mes = 1; mes <= 12; mes++) for (const e of leerMes(dir, mes)) usados.add(e.id);
  }

  for (const mes of meses) {
    const archivo = path.join(dir, nombreArchivo(mes));
    if (soloPais) {
      const { alcance, nombre } = PAISES[soloPais];
      const existentes = leerMes(dir, mes);
      const nuevas = await importarMes(mes, hoy, hoyArg.anio, usados, [alcance]);
      const fusionadas = fusionarPais(existentes, nuevas, alcance as AlcancePais);
      const parsed = archivoEfemeridesSchema.safeParse(fusionadas);
      if (!parsed.success) {
        console.error(`✗ mes ${mes}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
        process.exit(1);
      }
      fs.writeFileSync(archivo, `${JSON.stringify(fusionadas, null, 2)}\n`);
      const reclasificadas = fusionadas.filter((e) => e.alcance === alcance && e.tambienInternacional).length;
      const agregadas = fusionadas.length - existentes.length;
      total += agregadas;
      console.log(`✓ ${nombreArchivo(mes)}: +${agregadas} de ${nombre}, ${reclasificadas} reclasificadas`);
      continue;
    }
    const efemerides = await importarMes(mes, hoy, hoyArg.anio, usados, ALCANCES_COMPLETOS);
    const parsed = archivoEfemeridesSchema.safeParse(efemerides);
    if (!parsed.success) {
      console.error(`✗ mes ${mes}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      process.exit(1);
    }
    fs.writeFileSync(archivo, `${JSON.stringify(efemerides, null, 2)}\n`);
    const porPais = CODIGOS_PAIS.map(
      (codigo) => `${efemerides.filter((e) => e.alcance === PAISES[codigo].alcance).length} de ${PAISES[codigo].nombre}`,
    ).join(", ");
    const diasConDatos = new Set(efemerides.map((e) => e.fecha.dia)).size;
    total += efemerides.length;
    console.log(`✓ ${nombreArchivo(mes)}: ${efemerides.length} efemérides (${porPais}), ${diasConDatos}/${diasDelMes(mes, ANIO_BISIESTO_REFERENCIA)} días con datos`);
  }
  console.log(soloPais ? `${total} de ${PAISES[soloPais].nombre} agregadas en ${meses.length} archivos` : `${total} efemérides escritas en ${meses.length} archivos`);
}

void main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
