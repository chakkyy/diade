import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAISES, PARAMETROS_PAIS, paisDeParametro } from "@/lib/paises";

export const dynamicParams = false;

export function generateStaticParams() {
  return PARAMETROS_PAIS.map((pais) => ({ pais }));
}

export async function generateMetadata(props: LayoutProps<"/[pais]">): Promise<Metadata> {
  const codigo = paisDeParametro((await props.params).pais);
  if (!codigo) notFound();
  const pais = PAISES[codigo];
  return {
    description: `Qué se celebra hoy en ${pais.nombre} y en el mundo: días profesionales, efemérides y conmemoraciones, cada una con fuente verificable.`,
    openGraph: {
      type: "website",
      locale: pais.locale,
      siteName: "¿Qué se celebra hoy?",
      title: "¿Qué se celebra hoy?",
      description: `Qué se celebra hoy en ${pais.nombre} y en el mundo, con fuente verificable y horario de ${pais.ciudad}.`,
    },
  };
}

export default async function LayoutPais(props: LayoutProps<"/[pais]">) {
  if (!paisDeParametro((await props.params).pais)) notFound();
  return props.children;
}
