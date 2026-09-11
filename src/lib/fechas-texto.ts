import type { FechaCelebracion } from "@/types/celebracion";
import { esFechaMovil } from "@/types/celebracion";
import { DIAS_SEMANA, MESES, formatearFechaCorta } from "@/lib/fechas";

const ORDINALES: Record<string, string> = {
  "1": "primer",
  "2": "segundo",
  "3": "tercer",
  "4": "cuarto",
  "-1": "último",
};

export function describirFecha(fecha: FechaCelebracion, anio: number): string {
  void anio;
  if (!esFechaMovil(fecha)) return formatearFechaCorta(fecha);
  const ordinal = ORDINALES[String(fecha.ordinal)];
  const diaSemana = DIAS_SEMANA[fecha.diaSemana];
  const mes = MESES[fecha.mes - 1];
  return `${ordinal} ${diaSemana} de ${mes}`;
}
