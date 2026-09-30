import type { Metadata } from "next";
import VistaFecha, { metadataDeFecha, paramsDeFechas } from "@/vistas/VistaFecha";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return paramsDeFechas();
}

export async function generateMetadata(props: PageProps<"/co/fecha/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return metadataDeFecha("co", slug);
}

export default async function PaginaFechaColombia(props: PageProps<"/co/fecha/[slug]">) {
  const { slug } = await props.params;
  return <VistaFecha pais="co" slug={slug} />;
}
