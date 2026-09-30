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
  hoyEn,
  slugDeFecha,
  type FechaDia,
} from "@/lib/fechas";
import { PAISES, rutaDePais, type CodigoPais } from "@/lib/paises";
import { proximosDestacados } from "@/lib/proximos";
import { descripcionDeFecha, tituloDeFecha } from "@/lib/seo";

const ANIO_BISIESTO_REFERENCIA = 2024;

export function paramsDeFechas() {
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

export function metadataDeFecha(pais: CodigoPais, slug: string): Metadata {
  const fecha = fechaDeSlug(slug);
  if (!fecha) return { title: "Fecha no encontrada" };

  const anio = anioDeReferencia(fecha, hoyEn(pais).anio);
  const celebraciones = celebracionesDeFecha(fecha, anio, pais);
  const titulo = tituloDeFecha(celebraciones, fecha, pais);
  const descripcion = descripcionDeFecha(celebraciones, fecha, pais);
  const url = rutaDePais(pais, `/fecha/${slugDeFecha(fecha)}`);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: PAISES[pais].locale,
      title: `${titulo} · ¿Qué se celebra hoy?`,
      description: descripcion,
      url,
    },
  };
}

export default function VistaFecha({ pais, slug }: { pais: CodigoPais; slug: string }) {
  const fecha = fechaDeSlug(slug);
  if (!fecha) notFound();

  const anio = anioDeReferencia(fecha, hoyEn(pais).anio);
  const celebraciones = celebracionesDeFecha(fecha, anio, pais);
  const proximos = proximosDestacados(fecha, anio, 3, cargarTodas(), pais);
  const efemerides = efemeridesDeFecha(fecha, pais, cargarEfemerides());

  return (
    <NavegacionDia
      hrefAnterior={rutaDePais(pais, `/fecha/${slugDeFecha(fechaAnterior(fecha, anio))}`)}
      hrefSiguiente={rutaDePais(pais, `/fecha/${slugDeFecha(fechaSiguiente(fecha, anio))}`)}
    >
      <DiaHeader fecha={fecha} anio={anio} esHoy="auto" pais={pais} />
      <ListaCelebraciones celebraciones={celebraciones} pais={pais} />
      <EfemeridesDelDia efemerides={efemerides} pais={pais} />
      <ProximosDestacados proximos={proximos} pais={pais} />
    </NavegacionDia>
  );
}
