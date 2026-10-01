import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PARAMETROS_PAIS, paisDeParametro } from "@/lib/paises";
import VistaFecha, { metadataDeFecha, paramsDeFechas } from "@/vistas/VistaFecha";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  const fechas = paramsDeFechas();
  return PARAMETROS_PAIS.flatMap((pais) => fechas.map(({ slug }) => ({ pais, slug })));
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
