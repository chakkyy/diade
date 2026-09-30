import type { Metadata } from "next";
import DiaHeader from "@/components/DiaHeader";
import EfemeridesDelDia from "@/components/EfemeridesDelDia";
import ListaCelebraciones from "@/components/ListaCelebraciones";
import NavegacionDia from "@/components/NavegacionDia";
import ProximosDestacados from "@/components/ProximosDestacados";
import { cargarTodas, celebracionesDeFecha } from "@/lib/celebraciones";
import { cargarEfemerides, efemeridesDeFecha } from "@/lib/efemerides";
import { fechaAnterior, fechaSiguiente, formatearFechaLarga, hoyEn, slugDeFecha } from "@/lib/fechas";
import { PAISES, rutaDePais, type CodigoPais } from "@/lib/paises";
import { proximosDestacados } from "@/lib/proximos";
import { descripcionDeHoy } from "@/lib/seo";

export async function metadataDeHoy(pais: CodigoPais): Promise<Metadata> {
  const hoy = hoyEn(pais);
  const fecha = { dia: hoy.dia, mes: hoy.mes };
  const larga = formatearFechaLarga(fecha, hoy.anio);
  const titulo = `Hoy, ${larga}`;
  const descripcion = descripcionDeHoy(celebracionesDeFecha(fecha, hoy.anio, pais), larga, pais);
  const url = rutaDePais(pais, "/");

  return {
    title: { absolute: `${titulo} · ¿Qué se celebra hoy?` },
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: PAISES[pais].locale,
      title: `${titulo} · ¿Qué se celebra hoy?`,
      description: descripcion,
      url,
    },
  };
}

export default function VistaHoy({ pais }: { pais: CodigoPais }) {
  const hoy = hoyEn(pais);
  const fecha = { dia: hoy.dia, mes: hoy.mes };
  const celebraciones = celebracionesDeFecha(fecha, hoy.anio, pais);
  const proximos = proximosDestacados(fecha, hoy.anio, 3, cargarTodas(), pais);
  const efemerides = efemeridesDeFecha(fecha, pais, cargarEfemerides());

  return (
    <NavegacionDia
      hrefAnterior={rutaDePais(pais, `/fecha/${slugDeFecha(fechaAnterior(fecha, hoy.anio))}`)}
      hrefSiguiente={rutaDePais(pais, `/fecha/${slugDeFecha(fechaSiguiente(fecha, hoy.anio))}`)}
    >
      <DiaHeader fecha={fecha} anio={hoy.anio} esHoy pais={pais} />
      <ListaCelebraciones celebraciones={celebraciones} pais={pais} />
      <EfemeridesDelDia efemerides={efemerides} pais={pais} />
      <ProximosDestacados proximos={proximos} pais={pais} />
    </NavegacionDia>
  );
}
