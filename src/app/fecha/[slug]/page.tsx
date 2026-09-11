import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DiaHeader from "@/components/DiaHeader";
import ListaCelebraciones from "@/components/ListaCelebraciones";
import { celebracionesDeFecha } from "@/lib/celebraciones";
import {
  diasDelMes,
  esFechaValida,
  fechaDeSlug,
  hoyEnArgentina,
  slugDeFecha,
  type FechaDia,
} from "@/lib/fechas";
import { descripcionDeFecha, tituloDeFecha } from "@/lib/seo";

const ANIO_BISIESTO_REFERENCIA = 2024;

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (let mes = 1; mes <= 12; mes++) {
    for (let dia = 1; dia <= diasDelMes(mes, ANIO_BISIESTO_REFERENCIA); dia++) {
      params.push({ slug: slugDeFecha({ dia, mes }) });
    }
  }
  return params;
}

function anioDeReferencia(fecha: FechaDia, anio: number): number {
  let candidato = anio;
  while (!esFechaValida(fecha, candidato)) candidato += 1;
  return candidato;
}

export async function generateMetadata(props: PageProps<"/fecha/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const fecha = fechaDeSlug(slug);
  if (!fecha) return { title: "Fecha no encontrada" };

  const anio = anioDeReferencia(fecha, hoyEnArgentina().anio);
  const celebraciones = celebracionesDeFecha(fecha, anio);
  const titulo = tituloDeFecha(celebraciones, fecha);
  const descripcion = descripcionDeFecha(celebraciones, fecha);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/fecha/${slug}` },
    openGraph: {
      type: "article",
      locale: "es_AR",
      title: `${titulo} · ¿Qué se celebra hoy?`,
      description: descripcion,
      url: `/fecha/${slug}`,
    },
  };
}

export default async function PaginaFecha(props: PageProps<"/fecha/[slug]">) {
  const { slug } = await props.params;
  const fecha = fechaDeSlug(slug);
  if (!fecha) notFound();

  const hoy = hoyEnArgentina();
  const anio = anioDeReferencia(fecha, hoy.anio);
  const esHoy = anio === hoy.anio && fecha.dia === hoy.dia && fecha.mes === hoy.mes;
  const celebraciones = celebracionesDeFecha(fecha, anio);

  return (
    <>
      <DiaHeader fecha={fecha} anio={anio} esHoy={esHoy} />
      <ListaCelebraciones celebraciones={celebraciones} anio={anio} />
    </>
  );
}
