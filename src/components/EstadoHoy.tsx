"use client";

import { useSyncExternalStore } from "react";
import EtiquetaDia from "@/components/EtiquetaDia";
import { hoyEn } from "@/lib/fechas";
import type { CodigoPais } from "@/lib/paises";

function sinSuscripcion(): () => void {
  return () => {};
}

function leerEsHoyServidor(): boolean {
  return false;
}

export default function EstadoHoy({
  dia,
  mes,
  anio,
  pais,
}: {
  dia: number;
  mes: number;
  anio: number;
  pais: CodigoPais;
}) {
  const esHoy = useSyncExternalStore(
    sinSuscripcion,
    () => {
      const hoy = hoyEn(pais);
      return hoy.dia === dia && hoy.mes === mes;
    },
    leerEsHoyServidor,
  );

  return <EtiquetaDia esHoy={esHoy} anio={anio} pais={pais} />;
}
