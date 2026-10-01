import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { paisDeParametro } from "@/lib/paises";
import VistaHoy, { metadataDeHoy } from "@/vistas/VistaHoy";

export async function generateMetadata(props: PageProps<"/[pais]">): Promise<Metadata> {
  await connection();
  const pais = paisDeParametro((await props.params).pais);
  if (!pais) notFound();
  return metadataDeHoy(pais);
}

export default async function PaginaHoyPais(props: PageProps<"/[pais]">) {
  await connection();
  const pais = paisDeParametro((await props.params).pais);
  if (!pais) notFound();
  return <VistaHoy pais={pais} />;
}
