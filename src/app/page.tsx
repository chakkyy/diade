import type { Metadata } from "next";
import { connection } from "next/server";
import DiaHeader from "@/components/DiaHeader";
import ListaCelebraciones from "@/components/ListaCelebraciones";
import { celebracionesDeFecha } from "@/lib/celebraciones";
import { formatearFechaLarga, hoyEnArgentina } from "@/lib/fechas";
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

  return (
    <>
      <DiaHeader fecha={fecha} anio={hoy.anio} esHoy />
      <ListaCelebraciones celebraciones={celebraciones} anio={hoy.anio} />
    </>
  );
}
