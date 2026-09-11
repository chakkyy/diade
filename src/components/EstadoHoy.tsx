"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
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

  return (
    <div className="flex items-baseline justify-between gap-3">
      <p
        className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${
          esHoy ? "text-acento-texto" : "text-texto-secundario"
        }`}
      >
        {esHoy ? "Hoy" : String(anio)}
      </p>
      {esHoy ? null : (
        <Link
          href="/"
          className="text-[13px] text-acento-texto underline-offset-2 hover:underline"
        >
          Ir a hoy
        </Link>
      )}
    </div>
  );
}
