import { esFechaMovil, type Celebracion } from "@/types/celebracion";
import { esFechaValida, resolverFechaMovil, type FechaDia } from "@/lib/fechas";

export interface ProximoDestacado {
  celebracion: Celebracion;
  fecha: FechaDia;
  enDias: number;
}

const ANIOS_A_MIRAR = 5;

function aUtc(fecha: FechaDia, anio: number): number {
  return Date.UTC(anio, fecha.mes - 1, fecha.dia);
}

function proximaAparicion(
  celebracion: Celebracion,
  desde: FechaDia,
  anio: number,
): { fecha: FechaDia; enDias: number } | null {
  const origen = aUtc(desde, anio);

  for (let sumar = 0; sumar < ANIOS_A_MIRAR; sumar++) {
    const anioCandidato = anio + sumar;
    const fecha = esFechaMovil(celebracion.fecha)
      ? resolverFechaMovil(celebracion.fecha, anioCandidato)
      : celebracion.fecha;
    if (!esFechaValida(fecha, anioCandidato)) continue;
    const enDias = Math.round((aUtc(fecha, anioCandidato) - origen) / 86_400_000);
    if (enDias > 0) return { fecha, enDias };
  }

  return null;
}

export function proximosDestacados(
  desde: FechaDia,
  anio: number,
  cantidad: number,
  todas: Celebracion[],
): ProximoDestacado[] {
  const proximos: ProximoDestacado[] = [];

  for (const celebracion of todas) {
    if (!celebracion.destacado) continue;
    const aparicion = proximaAparicion(celebracion, desde, anio);
    if (aparicion === null) continue;
    proximos.push({ celebracion, ...aparicion });
  }

  return proximos
    .sort((a, b) => {
      if (a.enDias !== b.enDias) return a.enDias - b.enDias;
      return a.celebracion.nombre.localeCompare(b.celebracion.nombre, "es");
    })
    .slice(0, cantidad);
}

export function textoEnDias(enDias: number): string {
  if (enDias === 1) return "mañana";
  return `en ${enDias} días`;
}
