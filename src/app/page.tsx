import type { Metadata } from "next";
import { connection } from "next/server";
import DiaHeader from "@/components/DiaHeader";
import ListaCelebraciones from "@/components/ListaCelebraciones";
import NavegacionDia from "@/components/NavegacionDia";
import ProximosDestacados from "@/components/ProximosDestacados";
import { cargarTodas, celebracionesDeFecha } from "@/lib/celebraciones";
import {
  fechaAnterior,
  fechaSiguiente,
  formatearFechaLarga,
  hoyEnArgentina,
  slugDeFecha,
} from "@/lib/fechas";
import { proximosDestacados } from "@/lib/proximos";
import { descripcionDeHoy } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const hoy = hoyEnArgentina();
  const fecha = { dia: hoy.dia, mes: hoy.mes };
  const larga = formatearFechaLarga(fecha, hoy.anio);
  const titulo = `Hoy, ${larga}`;
  const descripcion = descripcionDeHoy(celebracionesDeFecha(fecha, hoy.anio), larga);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_AR",
      title: `${titulo} · ¿Qué se celebra hoy?`,
      description: descripcion,
      url: "/",
    },
  };
}

export default async function Home() {
  await connection();
  const hoy = hoyEnArgentina();
  const fecha = { dia: hoy.dia, mes: hoy.mes };
  const celebraciones = celebracionesDeFecha(fecha, hoy.anio);
  const proximos = proximosDestacados(fecha, hoy.anio, 3, cargarTodas());

  return (
    <NavegacionDia
      hrefAnterior={`/fecha/${slugDeFecha(fechaAnterior(fecha, hoy.anio))}`}
      hrefSiguiente={`/fecha/${slugDeFecha(fechaSiguiente(fecha, hoy.anio))}`}
    >
      <DiaHeader fecha={fecha} anio={hoy.anio} esHoy />
      <ListaCelebraciones celebraciones={celebraciones} anio={hoy.anio} />
      <ProximosDestacados proximos={proximos} />
    </NavegacionDia>
  );
}
