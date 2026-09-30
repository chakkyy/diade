import type { Metadata } from "next";
import Buscador from "@/components/Buscador";
import { leerFiltros } from "@/lib/buscar-url";
import { indiceBusqueda } from "@/lib/celebraciones";
import { hoyEn } from "@/lib/fechas";
import { rutaDePais, type CodigoPais } from "@/lib/paises";

type Parametros = Record<string, string | string[] | undefined>;

export function metadataDeBuscar(pais: CodigoPais, searchParams: Parametros): Metadata {
  const { q } = leerFiltros(searchParams, pais);

  return {
    title: q.trim() === "" ? "Buscar" : `Resultados para "${q.trim()}"`,
    description: "Buscá celebraciones por nombre, profesión o tema y filtrá por alcance y categoría.",
    alternates: { canonical: rutaDePais(pais, "/buscar") },
  };
}

export default function VistaBuscar({ pais, searchParams }: { pais: CodigoPais; searchParams: Parametros }) {
  return (
    <Buscador
      indice={indiceBusqueda()}
      inicial={leerFiltros(searchParams, pais)}
      anio={hoyEn(pais).anio}
      pais={pais}
    />
  );
}
