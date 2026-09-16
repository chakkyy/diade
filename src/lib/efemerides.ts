import fs from "node:fs";
import path from "node:path";
import type { Efemeride } from "@/types/efemeride";
import { archivoEfemeridesSchema } from "@/lib/schema";
import type { FechaDia } from "@/lib/fechas";

const cache = new Map<string, Efemeride[]>();

export function cargarEfemerides(dir: string = path.join(process.cwd(), "data", "efemerides")): Efemeride[] {
  const existente = cache.get(dir);
  if (existente) return existente;

  const archivos = fs.readdirSync(dir).filter((f) => /^\d{2}\.json$/.test(f)).sort();
  const todas: Efemeride[] = [];
  for (const archivo of archivos) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, archivo), "utf8"));
    const parsed = archivoEfemeridesSchema.safeParse(raw);
    if (!parsed.success) {
      const detalle = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`${archivo}: ${detalle}`);
    }
    todas.push(...parsed.data);
  }

  cache.set(dir, todas);
  return todas;
}

const ORDEN_ALCANCE: Record<Efemeride["alcance"], number> = { argentina: 0, internacional: 1 };

export function efemeridesDeFecha(f: FechaDia, todas: Efemeride[] = cargarEfemerides()): Efemeride[] {
  return todas
    .filter((e) => e.fecha.dia === f.dia && e.fecha.mes === f.mes)
    .sort(
      (a, b) =>
        ORDEN_ALCANCE[a.alcance] - ORDEN_ALCANCE[b.alcance] ||
        a.anio - b.anio ||
        a.texto.localeCompare(b.texto, "es"),
    );
}

export function agruparEfemerides(lista: Efemeride[]): { argentina: Efemeride[]; internacional: Efemeride[] } {
  const grupos = { argentina: [] as Efemeride[], internacional: [] as Efemeride[] };
  for (const e of lista) grupos[e.alcance].push(e);
  return grupos;
}
