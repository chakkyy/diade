import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MESES } from "@/lib/fechas";
import { paisDeParametro } from "@/lib/paises";
import VistaCalendarioMes, { metadataDeCalendarioMes } from "@/vistas/VistaCalendarioMes";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return MESES.map((mes) => ({ mes }));
}

export async function generateMetadata(props: PageProps<"/[pais]/calendario/[mes]">): Promise<Metadata> {
  const { pais: valor, mes } = await props.params;
  const pais = paisDeParametro(valor);
  if (!pais) notFound();
  return metadataDeCalendarioMes(pais, mes);
}

export default async function PaginaCalendarioMesPais(props: PageProps<"/[pais]/calendario/[mes]">) {
  const { pais: valor, mes } = await props.params;
  const pais = paisDeParametro(valor);
  if (!pais) notFound();
  return <VistaCalendarioMes pais={pais} slug={mes} />;
}
