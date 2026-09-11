import fs from "node:fs";
import path from "node:path";
import type { Alcance, Celebracion, ItemIndice } from "@/types/celebracion";
import { esFechaMovil } from "@/types/celebracion";
import { archivoMesSchema } from "@/lib/schema";
import { diasDelMes, resolverFechaMovil, type FechaDia } from "@/lib/fechas";

const cache = new Map<string, Celebracion[]>();

export function cargarTodas(dir: string = path.join(process.cwd(), "data", "celebraciones")): Celebracion[] {
  const existente = cache.get(dir);
  if (existente) return existente;

  const archivos = fs.readdirSync(dir).filter((f) => /^\d{2}\.json$/.test(f)).sort();
  const todas: Celebracion[] = [];
  for (const archivo of archivos) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, archivo), "utf8"));
    const parsed = archivoMesSchema.safeParse(raw);
    if (!parsed.success) {
      const detalle = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`${archivo}: ${detalle}`);
    }
    // zod infiere diaSemana como number (min/max), no como el literal 0|1|..|6 de FechaMovil;
    // el schema ya validó el rango en runtime, así que el cast es seguro.
    todas.push(...(parsed.data as unknown as Celebracion[]));
  }

  cache.set(dir, todas);
  return todas;
}

const ORDEN_ALCANCE: Record<Alcance, number> = { argentina: 0, internacional: 1, "otro-pais": 2 };

export function fechaResuelta(c: Celebracion, anio: number): FechaDia {
  return esFechaMovil(c.fecha) ? resolverFechaMovil(c.fecha, anio) : c.fecha;
}

export function celebracionesDeFecha(
  f: FechaDia,
  anio: number,
  todas: Celebracion[] = cargarTodas(),
): Celebracion[] {
  return todas
    .filter((c) => {
      const resuelta = fechaResuelta(c, anio);
      return resuelta.dia === f.dia && resuelta.mes === f.mes;
    })
    .sort((a, b) => {
      const porAlcance = ORDEN_ALCANCE[a.alcance] - ORDEN_ALCANCE[b.alcance];
      if (porAlcance !== 0) return porAlcance;
      const porDestacado = Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
      if (porDestacado !== 0) return porDestacado;
      return a.nombre.localeCompare(b.nombre, "es");
    });
}

export function agruparPorAlcance(lista: Celebracion[]): {
  argentina: Celebracion[];
  internacional: Celebracion[];
  otroPais: Celebracion[];
} {
  const grupos = { argentina: [] as Celebracion[], internacional: [] as Celebracion[], otroPais: [] as Celebracion[] };
  for (const c of lista) {
    if (c.alcance === "argentina") grupos.argentina.push(c);
    else if (c.alcance === "internacional") grupos.internacional.push(c);
    else grupos.otroPais.push(c);
  }
  return grupos;
}

export function celebracionPorId(id: string, todas: Celebracion[] = cargarTodas()): Celebracion | undefined {
  return todas.find((c) => c.id === id);
}

export function contarPorDia(
  mes: number,
  anio: number,
  todas: Celebracion[] = cargarTodas(),
): Map<number, { total: number; argentina: number; internacional: number; otroPais: number }> {
  const conteo = new Map<number, { total: number; argentina: number; internacional: number; otroPais: number }>();
  const totalDias = diasDelMes(mes, anio);
  for (const c of todas) {
    const resuelta = fechaResuelta(c, anio);
    if (resuelta.mes !== mes || resuelta.dia < 1 || resuelta.dia > totalDias) continue;
    const actual = conteo.get(resuelta.dia) ?? { total: 0, argentina: 0, internacional: 0, otroPais: 0 };
    actual.total++;
    if (c.alcance === "argentina") actual.argentina++;
    else if (c.alcance === "internacional") actual.internacional++;
    else actual.otroPais++;
    conteo.set(resuelta.dia, actual);
  }
  return conteo;
}

export function indiceBusqueda(todas: Celebracion[] = cargarTodas()): ItemIndice[] {
  return todas.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion,
    alcance: c.alcance,
    ...(c.pais !== undefined ? { pais: c.pais } : {}),
    categoria: c.categoria,
    ...(c.emoji !== undefined ? { emoji: c.emoji } : {}),
    ...(c.tags !== undefined ? { tags: c.tags } : {}),
    fecha: c.fecha,
  }));
}
