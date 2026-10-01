import type { Alcance, Categoria, ItemIndice } from "@/types/celebracion";
import { esFechaMovil } from "@/types/celebracion";
import { CODIGOS_PAIS, PAISES, grupoDeAlcance, prioridadDeAlcance, type CodigoPais } from "@/lib/paises";

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export interface FiltrosBusqueda {
  pais: CodigoPais;
  alcance?: Alcance[];
  categoria?: Categoria[];
}

export function alcancesDeFiltro(pais: CodigoPais): Alcance[] {
  return [PAISES[pais].alcance, "internacional", "otro-pais"];
}

function cumpleAlcance(item: ItemIndice, filtros: FiltrosBusqueda): boolean {
  if (!filtros.alcance) return true;
  const grupo = grupoDeAlcance(item.alcance, filtros.pais);
  if (grupo === "otros") return filtros.alcance.includes("otro-pais");
  return filtros.alcance.includes(item.alcance);
}

function cumpleFiltros(item: ItemIndice, filtros: FiltrosBusqueda): boolean {
  if (!cumpleAlcance(item, filtros)) return false;
  if (filtros.categoria && !filtros.categoria.includes(item.categoria)) return false;
  return true;
}

function camposBuscables(item: ItemIndice): string[] {
  const campos = [normalizar(item.nombre), normalizar(item.descripcion)];
  if (item.pais) campos.push(normalizar(item.pais));
  if (item.tags) campos.push(...item.tags.map(normalizar));
  return campos;
}

function coincideEnNombre(item: ItemIndice, palabras: string[]): boolean {
  const nombre = normalizar(item.nombre);
  return palabras.every((p) => nombre.includes(p));
}

function coincideItem(item: ItemIndice, palabras: string[]): boolean {
  const campos = camposBuscables(item);
  return palabras.every((p) => campos.some((c) => c.includes(p)));
}

function claveOrdinal(item: ItemIndice): number {
  return esFechaMovil(item.fecha) ? (item.fecha.ordinal === -1 ? 99 : item.fecha.ordinal) : item.fecha.dia;
}

function compararFecha(a: ItemIndice, b: ItemIndice): number {
  if (a.fecha.mes !== b.fecha.mes) return a.fecha.mes - b.fecha.mes;
  return claveOrdinal(a) - claveOrdinal(b);
}

function comparar(a: ItemIndice, b: ItemIndice, palabras: string[], pais: CodigoPais): number {
  if (palabras.length > 0) {
    const aEnNombre = coincideEnNombre(a, palabras);
    const bEnNombre = coincideEnNombre(b, palabras);
    if (aEnNombre !== bEnNombre) return aEnNombre ? -1 : 1;
    const porAlcance = prioridadDeAlcance(a.alcance, pais) - prioridadDeAlcance(b.alcance, pais);
    if (porAlcance !== 0) return porAlcance;
  }
  const porFecha = compararFecha(a, b);
  if (porFecha !== 0) return porFecha;
  return a.nombre.localeCompare(b.nombre, "es");
}

export function buscar(indice: ItemIndice[], query: string, opciones: FiltrosBusqueda): ItemIndice[] {
  const filtrado = indice.filter((item) => cumpleFiltros(item, opciones));
  const palabras = normalizar(query).split(" ").filter(Boolean);
  const resultado = palabras.length === 0 ? filtrado : filtrado.filter((item) => coincideItem(item, palabras));
  return resultado.slice().sort((a, b) => comparar(a, b, palabras, opciones.pais));
}

export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  profesion: "Profesión",
  salud: "Salud",
  ambiente: "Ambiente",
  educacion: "Educación",
  cultura: "Cultura",
  animales: "Animales",
  comida: "Comida",
  religion: "Religión",
  historia: "Historia",
  deporte: "Deporte",
  tecnologia: "Tecnología",
  ciencia: "Ciencia",
  sociedad: "Sociedad",
  derechos: "Derechos",
  familia: "Familia",
};

export const ETIQUETAS_ALCANCE: Record<Alcance, string> = {
  ...(Object.fromEntries(CODIGOS_PAIS.map((codigo) => [PAISES[codigo].alcance, PAISES[codigo].nombre])) as Record<
    (typeof PAISES)[CodigoPais]["alcance"],
    string
  >),
  internacional: "Internacional",
  "otro-pais": "Otros países",
};
