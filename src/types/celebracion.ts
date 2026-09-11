export const ALCANCES = ["argentina", "internacional", "otro-pais"] as const;
export type Alcance = (typeof ALCANCES)[number];

export const CATEGORIAS = [
  "profesion",
  "salud",
  "ambiente",
  "educacion",
  "cultura",
  "animales",
  "comida",
  "religion",
  "historia",
  "deporte",
  "tecnologia",
  "ciencia",
  "sociedad",
  "derechos",
  "familia",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const TIPOS_FUENTE = ["institucional", "asociacion", "normativa", "secundaria"] as const;
export type TipoFuente = (typeof TIPOS_FUENTE)[number];

export interface Fuente {
  nombre: string;
  url: string;
  tipo: TipoFuente;
}

export interface FechaFija {
  dia: number;
  mes: number;
}

export interface FechaMovil {
  mes: number;
  ordinal: 1 | 2 | 3 | 4 | -1;
  diaSemana: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export type FechaCelebracion = FechaFija | FechaMovil;

export interface Celebracion {
  id: string;
  nombre: string;
  fecha: FechaCelebracion;
  alcance: Alcance;
  pais?: string;
  categoria: Categoria;
  descripcion: string;
  fuentes: Fuente[];
  emoji?: string;
  tags?: string[];
  destacado?: boolean;
  verificadoEn: string;
}

export function esFechaMovil(fecha: FechaCelebracion): fecha is FechaMovil {
  return "ordinal" in fecha;
}

export interface ItemIndice {
  id: string;
  nombre: string;
  descripcion: string;
  alcance: Alcance;
  pais?: string;
  categoria: Categoria;
  emoji?: string;
  tags?: string[];
  fecha: FechaCelebracion;
}
