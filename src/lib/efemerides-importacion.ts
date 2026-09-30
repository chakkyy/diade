import type { Efemeride } from "@/types/efemeride";

const ARGENTINA = /\bargentin[oa]s?\b|\bArgentina\b|Buenos Aires|bonaerense|porteñ[oa]s?\b/i;
const COLOMBIA_GENTILICIO = /\bcolombian[oa]s?\b|\bColombia\b/i;
const COLOMBIA_LUGAR = /Bogotá|(?<!\p{L})Cali(?!\p{L})|Cartagena de Indias|Barranquilla|Nueva Granada/u;

export function alcanceDeTexto(texto: string): Efemeride["alcance"] {
  if (ARGENTINA.test(texto)) return "argentina";
  if (COLOMBIA_GENTILICIO.test(texto) || COLOMBIA_LUGAR.test(texto)) return "colombia";
  return "internacional";
}

function clave(e: Efemeride): string {
  return `${e.fecha.dia}|${e.anio}|${e.tipo}|${e.texto}`;
}

export function fusionarPais(existentes: Efemeride[], nuevas: Efemeride[], alcance: "colombia"): Efemeride[] {
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
