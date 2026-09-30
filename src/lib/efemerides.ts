import fs from "node:fs";
import path from "node:path";
import type { Efemeride } from "@/types/efemeride";
import { archivoEfemeridesSchema } from "@/lib/schema";
import type { FechaDia } from "@/lib/fechas";
import { PAISES, type CodigoPais } from "@/lib/paises";

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

type GrupoEfemeride = "local" | "internacional";

function grupoDeEfemeride(e: Efemeride, pais: CodigoPais): GrupoEfemeride | null {
  if (e.alcance === PAISES[pais].alcance) return "local";
  if (e.alcance === "internacional") return "internacional";
  return e.tambienInternacional ? "internacional" : null;
}

const ORDEN_GRUPO: Record<GrupoEfemeride, number> = { local: 0, internacional: 1 };

export function efemeridesDeFecha(
  f: FechaDia,
  pais: CodigoPais,
  todas: Efemeride[] = cargarEfemerides(),
): Efemeride[] {
  return todas
    .filter((e) => e.fecha.dia === f.dia && e.fecha.mes === f.mes)
    .map((e) => ({ e, grupo: grupoDeEfemeride(e, pais) }))
    .filter((x): x is { e: Efemeride; grupo: GrupoEfemeride } => x.grupo !== null)
    .sort(
      (a, b) =>
        ORDEN_GRUPO[a.grupo] - ORDEN_GRUPO[b.grupo] ||
        a.e.anio - b.e.anio ||
        a.e.texto.localeCompare(b.e.texto, "es"),
    )
    .map((x) => x.e);
}

export function agruparEfemerides(
  lista: Efemeride[],
  pais: CodigoPais,
): { local: Efemeride[]; internacional: Efemeride[] } {
  const grupos = { local: [] as Efemeride[], internacional: [] as Efemeride[] };
  for (const e of lista) {
    const grupo = grupoDeEfemeride(e, pais);
    if (grupo !== null) grupos[grupo].push(e);
  }
  return grupos;
}
