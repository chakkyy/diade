import type { FechaMovil, TipoFuente } from "@/types/celebracion";
import { DIAS_SEMANA, MESES, formatearFechaCorta, resolverFechaMovil } from "@/lib/fechas";

const ORDINAL_PALABRA: Record<1 | 2 | 3 | 4, string> = {
  1: "primer",
  2: "segundo",
  3: "tercer",
  4: "cuarto",
};

export function describirReglaMovil(regla: FechaMovil): string {
  const diaSemana = DIAS_SEMANA[regla.diaSemana];
  const mes = MESES[regla.mes - 1];
  const ordinal = regla.ordinal === -1 ? "último" : ORDINAL_PALABRA[regla.ordinal];
  return `${ordinal} ${diaSemana} de ${mes}`;
}

export function describirFechaMovilEsteAnio(regla: FechaMovil, anio: number): string {
  const resuelta = resolverFechaMovil(regla, anio);
  return `${describirReglaMovil(regla)} · en ${anio} cae el ${formatearFechaCorta(resuelta)}`;
}

const BANDERAS_PAIS: Record<string, string> = {
  Bolivia: "🇧🇴",
  Brasil: "🇧🇷",
  Chile: "🇨🇱",
  España: "🇪🇸",
  "Estados Unidos": "🇺🇸",
  México: "🇲🇽",
  Uruguay: "🇺🇾",
};

export function banderaDePais(pais: string): string {
  return BANDERAS_PAIS[pais] ?? "🌐";
}

export const ETIQUETAS_TIPO_FUENTE: Record<TipoFuente, string> = {
  institucional: "institucional",
  asociacion: "asociación",
  normativa: "normativa",
  secundaria: "secundaria",
};

export function dominioDeUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
