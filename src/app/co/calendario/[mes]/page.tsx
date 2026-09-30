import type { Metadata } from "next";
import { MESES } from "@/lib/fechas";
import VistaCalendarioMes, { metadataDeCalendarioMes } from "@/vistas/VistaCalendarioMes";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return MESES.map((mes) => ({ mes }));
}

export async function generateMetadata(props: PageProps<"/co/calendario/[mes]">): Promise<Metadata> {
  const { mes } = await props.params;
  return metadataDeCalendarioMes("co", mes);
}

export default async function PaginaCalendarioMesColombia(props: PageProps<"/co/calendario/[mes]">) {
  const { mes } = await props.params;
  return <VistaCalendarioMes pais="co" slug={mes} />;
}
