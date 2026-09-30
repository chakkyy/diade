import type { Alcance } from "@/types/celebracion";

export interface Pais {
  codigo: string;
  alcance: Alcance;
  nombre: string;
  bandera: string;
  zona: string;
  locale: string;
  prefijo: string;
  ciudad: string;
}

export const PAISES = {
  ar: {
    codigo: "ar",
    alcance: "argentina",
    nombre: "Argentina",
    bandera: "🇦🇷",
    zona: "America/Argentina/Buenos_Aires",
    locale: "es_AR",
    prefijo: "",
    ciudad: "Buenos Aires",
  },
  co: {
    codigo: "co",
    alcance: "colombia",
    nombre: "Colombia",
    bandera: "🇨🇴",
    zona: "America/Bogota",
    locale: "es_CO",
    prefijo: "/co",
    ciudad: "Bogotá",
  },
} as const satisfies Record<string, Pais>;

export type CodigoPais = keyof typeof PAISES;
export const CODIGOS_PAIS = Object.keys(PAISES) as CodigoPais[];

export type GrupoAlcance = "local" | "internacional" | "otros";

const ORDEN_GRUPO: Record<GrupoAlcance, number> = { local: 0, internacional: 1, otros: 2 };

export function grupoDeAlcance(alcance: Alcance, pais: CodigoPais): GrupoAlcance {
  if (alcance === PAISES[pais].alcance) return "local";
  if (alcance === "internacional") return "internacional";
  return "otros";
}

export function prioridadDeAlcance(alcance: Alcance, pais: CodigoPais): number {
  return ORDEN_GRUPO[grupoDeAlcance(alcance, pais)];
}

export function paisDeAlcance(alcance: Alcance): (typeof PAISES)[CodigoPais] | null {
  for (const codigo of CODIGOS_PAIS) {
    if (PAISES[codigo].alcance === alcance) return PAISES[codigo];
  }
  return null;
}

export function rutaDePais(pais: CodigoPais, ruta: string): string {
  const prefijo = PAISES[pais].prefijo;
  if (ruta === "/") return prefijo === "" ? "/" : prefijo;
  return `${prefijo}${ruta}`;
}

export function paisDeRuta(pathname: string): CodigoPais {
  for (const codigo of CODIGOS_PAIS) {
    const prefijo = PAISES[codigo].prefijo;
    if (prefijo === "") continue;
    if (pathname === prefijo || pathname.startsWith(`${prefijo}/`)) return codigo;
  }
  return "ar";
}

export function rutaEnOtroPais(pathname: string, destino: CodigoPais): string {
  const prefijo = PAISES[paisDeRuta(pathname)].prefijo;
  const sinPrefijo = pathname.slice(prefijo.length);
  const base = sinPrefijo === "" ? "/" : sinPrefijo;
  return rutaDePais(destino, base === "/" ? "/" : base.replace(/\/$/, ""));
}

export function busquedaParaPais(search: string, destino: CodigoPais): string {
  const params = new URLSearchParams(search);
  const alcances = params.getAll("alcance");
  params.delete("alcance");
  for (const alcance of alcances) {
    const propio = paisDeAlcance(alcance as Alcance);
    if (propio === null || propio.codigo === destino) params.append("alcance", alcance);
  }
  const texto = params.toString();
  return texto === "" ? "" : `?${texto}`;
}
