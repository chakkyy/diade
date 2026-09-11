import type { Metadata } from "next";
import Buscador from "@/components/Buscador";
import { indiceBusqueda } from "@/lib/celebraciones";
import { leerFiltros } from "@/lib/buscar-url";
import { hoyEnArgentina } from "@/lib/fechas";

export async function generateMetadata(props: PageProps<"/buscar">): Promise<Metadata> {
  const { q } = leerFiltros(await props.searchParams);

  return {
    title: q.trim() === "" ? "Buscar" : `Resultados para "${q.trim()}"`,
    description: "Buscá celebraciones por nombre, profesión o tema y filtrá por alcance y categoría.",
    alternates: { canonical: "/buscar" },
  };
}

export default async function PaginaBuscar(props: PageProps<"/buscar">) {
  const inicial = leerFiltros(await props.searchParams);
  const indice = indiceBusqueda();
  const anio = hoyEnArgentina().anio;

  return <Buscador indice={indice} inicial={inicial} anio={anio} />;
}
