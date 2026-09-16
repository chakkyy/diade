import type { FechaFija, Fuente } from "@/types/celebracion";

export const TIPOS_EFEMERIDE = ["acontecimiento", "nacimiento", "fallecimiento"] as const;
export type TipoEfemeride = (typeof TIPOS_EFEMERIDE)[number];

export const ALCANCES_EFEMERIDE = ["argentina", "internacional"] as const;
export type AlcanceEfemeride = (typeof ALCANCES_EFEMERIDE)[number];

export interface Efemeride {
  id: string;
  fecha: FechaFija;
  anio: number;
  tipo: TipoEfemeride;
  texto: string;
  alcance: AlcanceEfemeride;
  fuentes: Fuente[];
  verificadoEn: string;
}
