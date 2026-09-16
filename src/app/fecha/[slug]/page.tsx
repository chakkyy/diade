import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DiaHeader from "@/components/DiaHeader";
import EfemeridesDelDia from "@/components/EfemeridesDelDia";
import ListaCelebraciones from "@/components/ListaCelebraciones";
import NavegacionDia from "@/components/NavegacionDia";
import ProximosDestacados from "@/components/ProximosDestacados";
import { cargarTodas, celebracionesDeFecha } from "@/lib/celebraciones";
import { cargarEfemerides, efemeridesDeFecha } from "@/lib/efemerides";
import {
  diasDelMes,
  esFechaValida,
  fechaAnterior,
  fechaDeSlug,
  fechaSiguiente,
  hoyEnArgentina,
  slugDeFecha,
  type FechaDia,
} from "@/lib/fechas";
import { proximosDestacados } from "@/lib/proximos";
import { descripcionDeFecha, tituloDeFecha } from "@/lib/seo";

const ANIO_BISIESTO_REFERENCIA = 2024;

export const revalidate = 3600;
export const dynamicParams = false;

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
  const slugNormalizado = slugDeFecha(fecha);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/fecha/${slugNormalizado}` },
    openGraph: {
      type: "article",
      locale: "es_AR",
      title: `${titulo} · ¿Qué se celebra hoy?`,
      description: descripcion,
      url: `/fecha/${slugNormalizado}`,
    },
  };
}

export default async function PaginaFecha(props: PageProps<"/fecha/[slug]">) {
  const { slug } = await props.params;
  const fecha = fechaDeSlug(slug);
  if (!fecha) notFound();

  const anio = anioDeReferencia(fecha, hoyEnArgentina().anio);
  const celebraciones = celebracionesDeFecha(fecha, anio);
  const proximos = proximosDestacados(fecha, anio, 3, cargarTodas());
  const efemerides = efemeridesDeFecha(fecha, cargarEfemerides());

  return (
    <NavegacionDia
      hrefAnterior={`/fecha/${slugDeFecha(fechaAnterior(fecha, anio))}`}
      hrefSiguiente={`/fecha/${slugDeFecha(fechaSiguiente(fecha, anio))}`}
    >
      <DiaHeader fecha={fecha} anio={anio} esHoy="auto" />
      <ListaCelebraciones celebraciones={celebraciones} />
      <EfemeridesDelDia efemerides={efemerides} />
      <ProximosDestacados proximos={proximos} />
    </NavegacionDia>
  );
}
