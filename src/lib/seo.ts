import type { Alcance, Celebracion } from "@/types/celebracion";
import { formatearFechaCorta, type FechaDia } from "@/lib/fechas";

const PRIORIDAD_ALCANCE: Record<Alcance, number> = {
  argentina: 0,
  internacional: 1,
  "otro-pais": 2,
};

export function ordenarPorRelevancia(celebraciones: Celebracion[]): Celebracion[] {
  return [...celebraciones].sort((a, b) => {
    const porAlcance = PRIORIDAD_ALCANCE[a.alcance] - PRIORIDAD_ALCANCE[b.alcance];
    if (porAlcance !== 0) return porAlcance;
    const porDestacado = Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
    if (porDestacado !== 0) return porDestacado;
    return 0;
  });
}

export function nombresPrincipales(celebraciones: Celebracion[], limite: number): string[] {
  return ordenarPorRelevancia(celebraciones)
    .slice(0, limite)
    .map((c) => c.nombre);
}

function listaConResto(celebraciones: Celebracion[], limite: number): string {
  const nombres = nombresPrincipales(celebraciones, limite);
  const resto = celebraciones.length - nombres.length;
  if (resto <= 0) return nombres.join(", ");
  return `${nombres.join(", ")} y ${resto} más`;
}

function cierreDeFuentes(cantidad: number): string {
  return cantidad === 1 ? "Con fuente verificable." : "Con fuentes verificables.";
}

export function tituloDeFecha(celebraciones: Celebracion[], fecha: FechaDia): string {
  const corta = formatearFechaCorta(fecha);
  if (celebraciones.length === 0) return corta;
  return `${corta}: ${listaConResto(celebraciones, 2)}`;
}

export function descripcionDeFecha(celebraciones: Celebracion[], fecha: FechaDia): string {
  const corta = formatearFechaCorta(fecha);
  if (celebraciones.length === 0) {
    return `Todavía no tenemos celebraciones registradas para el ${corta}.`;
  }
  const verbo = celebraciones.length === 1 ? "se celebra" : "se celebran";
  return `El ${corta} ${verbo}: ${listaConResto(celebraciones, 3)}. ${cierreDeFuentes(celebraciones.length)}`;
}

export function descripcionDeHoy(celebraciones: Celebracion[], fechaLarga: string): string {
  if (celebraciones.length === 0) {
    return `Hoy es ${fechaLarga} y todavía no tenemos celebraciones registradas.`;
  }
  const verbo = celebraciones.length === 1 ? "se celebra" : "se celebran";
  return `Hoy, ${fechaLarga}, ${verbo}: ${listaConResto(celebraciones, 3)}. ${cierreDeFuentes(celebraciones.length)}`;
}
