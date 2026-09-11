"use client";

import { useSyncExternalStore } from "react";
import EtiquetaDia from "@/components/EtiquetaDia";
import { hoyEnArgentina } from "@/lib/fechas";

function sinSuscripcion(): () => void {
  return () => {};
}

function leerEsHoyServidor(): boolean {
  return false;
}

export default function EstadoHoy({ dia, mes, anio }: { dia: number; mes: number; anio: number }) {
  const esHoy = useSyncExternalStore(
    sinSuscripcion,
    () => {
      const hoy = hoyEnArgentina();
      return hoy.dia === dia && hoy.mes === mes;
    },
    leerEsHoyServidor,
  );

  return <EtiquetaDia esHoy={esHoy} anio={anio} />;
}
