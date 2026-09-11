import type { FechaMovil } from "@/types/celebracion";

export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"] as const;

export interface FechaDia {
  dia: number;
  mes: number;
}

const DIAS_POR_MES_NO_BISIESTO = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

export function diasDelMes(mes: number, anio: number): number {
  if (mes === 2 && esBisiesto(anio)) return 29;
  return DIAS_POR_MES_NO_BISIESTO[mes - 1];
}

export function hoyEnArgentina(ahora: Date = new Date()): {
  dia: number;
  mes: number;
  anio: number;
  diaSemana: number;
} {
  const formateador = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const partes = formateador.formatToParts(ahora);
  const anio = Number(partes.find((p) => p.type === "year")?.value);
  const mes = Number(partes.find((p) => p.type === "month")?.value);
  const dia = Number(partes.find((p) => p.type === "day")?.value);
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return { dia, mes, anio, diaSemana };
}

export function slugDeFecha(f: FechaDia): string {
  return `${f.dia}-${MESES[f.mes - 1]}`;
}

const DIAS_MAX_SLUG = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function fechaDeSlug(slug: string): FechaDia | null {
  const partes = slug.split("-");
  if (partes.length !== 2) return null;
  const [diaTexto, mesTexto] = partes;
  if (!/^\d{1,2}$/.test(diaTexto)) return null;
  const mes = mesDeSlug(mesTexto);
  if (mes === null) return null;
  const dia = Number(diaTexto);
  if (dia < 1 || dia > DIAS_MAX_SLUG[mes - 1]) return null;
  return { dia, mes };
}

export function slugDeMes(mes: number): string {
  return MESES[mes - 1];
}

export function mesDeSlug(slug: string): number | null {
  const indice = MESES.findIndex((m) => m === slug.toLowerCase());
  return indice === -1 ? null : indice + 1;
}

function sumarDias(f: FechaDia, anio: number, delta: number): FechaDia {
  const d = new Date(Date.UTC(anio, f.mes - 1, f.dia));
  d.setUTCDate(d.getUTCDate() + delta);
  return { dia: d.getUTCDate(), mes: d.getUTCMonth() + 1 };
}

export function fechaAnterior(f: FechaDia, anio: number): FechaDia {
  return sumarDias(f, anio, -1);
}

export function fechaSiguiente(f: FechaDia, anio: number): FechaDia {
  return sumarDias(f, anio, 1);
}

export function resolverFechaMovil(regla: FechaMovil, anio: number): FechaDia {
  const { mes, ordinal, diaSemana } = regla;
  if (ordinal === -1) {
    const ultimoDia = diasDelMes(mes, anio);
    const diaSemanaUltimo = new Date(Date.UTC(anio, mes - 1, ultimoDia)).getUTCDay();
    const diferencia = (diaSemanaUltimo - diaSemana + 7) % 7;
    return { dia: ultimoDia - diferencia, mes };
  }
  const diaSemanaPrimero = new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay();
  const diferencia = (diaSemana - diaSemanaPrimero + 7) % 7;
  const primeraOcurrencia = 1 + diferencia;
  return { dia: primeraOcurrencia + 7 * (ordinal - 1), mes };
}

export function nombreDiaSemana(f: FechaDia, anio: number): string {
  return DIAS_SEMANA[new Date(Date.UTC(anio, f.mes - 1, f.dia)).getUTCDay()];
}

export function formatearFechaLarga(f: FechaDia, anio: number): string {
  return `${nombreDiaSemana(f, anio)} ${f.dia} de ${MESES[f.mes - 1]}`;
}

export function formatearFechaCorta(f: FechaDia): string {
  return `${f.dia} de ${MESES[f.mes - 1]}`;
}

export function esFechaValida(f: FechaDia, anio: number): boolean {
  if (f.mes < 1 || f.mes > 12) return false;
  return f.dia >= 1 && f.dia <= diasDelMes(f.mes, anio);
}
