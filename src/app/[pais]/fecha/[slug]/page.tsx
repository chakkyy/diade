import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { paisDeParametro } from "@/lib/paises";
import VistaFecha, { metadataDeFecha, paramsDeFechas } from "@/vistas/VistaFecha";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  const fechas = paramsDeFechas();
  return fechas.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/[pais]/fecha/[slug]">): Promise<Metadata> {
  const { pais: valor, slug } = await props.params;
  const pais = paisDeParametro(valor);
  if (!pais) notFound();
  return metadataDeFecha(pais, slug);
}

export default async function PaginaFechaPais(props: PageProps<"/[pais]/fecha/[slug]">) {
  const { pais: valor, slug } = await props.params;
  const pais = paisDeParametro(valor);
  if (!pais) notFound();
  return <VistaFecha pais={pais} slug={slug} />;
}
