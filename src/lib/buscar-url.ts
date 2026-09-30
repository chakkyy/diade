import { CATEGORIAS } from "@/types/celebracion";
import type { Alcance, Categoria } from "@/types/celebracion";
import { alcancesDeFiltro } from "@/lib/buscar";
import type { CodigoPais } from "@/lib/paises";

export interface FiltrosUrl {
  q: string;
  alcance: Alcance[];
  categoria: Categoria[];
}

type ValorParam = string | string[] | undefined;

function primerValor(valor: ValorParam): string {
  if (Array.isArray(valor)) return valor[0] ?? "";
  return valor ?? "";
}

function valoresValidos<T extends string>(valor: ValorParam, permitidos: readonly T[]): T[] {
  const lista = valor === undefined ? [] : Array.isArray(valor) ? valor : [valor];
  return lista.filter((v): v is T => (permitidos as readonly string[]).includes(v));
}

export function leerFiltros(searchParams: Record<string, ValorParam>, pais: CodigoPais): FiltrosUrl {
  return {
    q: primerValor(searchParams.q),
    alcance: valoresValidos(searchParams.alcance, alcancesDeFiltro(pais)),
    categoria: valoresValidos(searchParams.categoria, CATEGORIAS),
  };
}

export function escribirFiltros({ q, alcance, categoria }: FiltrosUrl): string {
  const params = new URLSearchParams();
  if (q !== "") params.set("q", q);
  for (const a of alcance) params.append("alcance", a);
  for (const c of categoria) params.append("categoria", c);
  return params.toString();
}
