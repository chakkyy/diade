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

function leerAnioServidor(): number {
  return new Date().getFullYear();
}

export default function EstadoHoy({ dia, mes }: { dia: number; mes: number }) {
  const esHoy = useSyncExternalStore(
    sinSuscripcion,
    () => {
      const hoy = hoyEnArgentina();
      return hoy.dia === dia && hoy.mes === mes;
    },
    leerEsHoyServidor,
  );
  const anio = useSyncExternalStore(sinSuscripcion, () => hoyEnArgentina().anio, leerAnioServidor);

  return <EtiquetaDia esHoy={esHoy} anio={anio} />;
}
