import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cargarTodas } from "@/lib/celebraciones";
import { PARAMETROS_PAIS, paisDeParametro } from "@/lib/paises";
import VistaCelebracion, { metadataDeCelebracion } from "@/vistas/VistaCelebracion";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  const celebraciones = cargarTodas();
  return PARAMETROS_PAIS.flatMap((pais) => celebraciones.map((c) => ({ pais, id: c.id })));
}

export async function generateMetadata(props: PageProps<"/[pais]/celebracion/[id]">): Promise<Metadata> {
  const { pais: valor, id } = await props.params;
  const pais = paisDeParametro(valor);
  if (!pais) notFound();
  return metadataDeCelebracion(pais, id);
}

export default async function PaginaCelebracionPais(props: PageProps<"/[pais]/celebracion/[id]">) {
  const { pais: valor, id } = await props.params;
  const pais = paisDeParametro(valor);
  if (!pais) notFound();
  return <VistaCelebracion pais={pais} id={id} />;
}
