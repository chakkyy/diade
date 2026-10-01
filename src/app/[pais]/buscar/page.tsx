import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { paisDeParametro } from "@/lib/paises";
import VistaBuscar, { metadataDeBuscar } from "@/vistas/VistaBuscar";

export async function generateMetadata(props: PageProps<"/[pais]/buscar">): Promise<Metadata> {
  const pais = paisDeParametro((await props.params).pais);
  if (!pais) notFound();
  return metadataDeBuscar(pais, await props.searchParams);
}

export default async function PaginaBuscarPais(props: PageProps<"/[pais]/buscar">) {
  const pais = paisDeParametro((await props.params).pais);
  if (!pais) notFound();
  return <VistaBuscar pais={pais} searchParams={await props.searchParams} />;
}
