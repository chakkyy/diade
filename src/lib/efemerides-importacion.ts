import type { Efemeride } from "@/types/efemeride";
import { CODIGOS_PAIS, PAISES } from "@/lib/paises";

export type AlcancePais = Exclude<Efemeride["alcance"], "internacional">;

export function alcanceDeTexto(texto: string): Efemeride["alcance"] {
  for (const codigo of CODIGOS_PAIS) {
    const { deteccion, alcance } = PAISES[codigo];
    if (deteccion.gentilicio.test(texto) || deteccion.lugares.test(texto)) return alcance;
  }
  return "internacional";
}

function clave(e: Efemeride): string {
  return `${e.fecha.dia}|${e.anio}|${e.tipo}|${e.texto}`;
}

export function fusionarPais(existentes: Efemeride[], nuevas: Efemeride[], alcance: AlcancePais): Efemeride[] {
  const clavesNuevas = new Set(nuevas.map(clave));
  const clavesExistentes = new Set(existentes.map(clave));

  const conservadas = existentes.map((e): Efemeride => {
    if (e.alcance !== "internacional" || !clavesNuevas.has(clave(e))) return e;
    return {
      id: e.id,
      fecha: e.fecha,
      anio: e.anio,
      tipo: e.tipo,
      texto: e.texto,
      alcance,
      tambienInternacional: true,
      fuentes: e.fuentes,
      verificadoEn: e.verificadoEn,
    };
  });
  const agregadas = nuevas.filter((e) => {
    const k = clave(e);
    if (clavesExistentes.has(k)) return false;
    clavesExistentes.add(k);
    return true;
  });

  return [...conservadas, ...agregadas].sort((a, b) => a.fecha.dia - b.fecha.dia || a.anio - b.anio);
}
