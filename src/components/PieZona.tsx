"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { PAISES, paisDeRuta } from "@/lib/paises";

const sinSuscripcion = () => () => {};
const enCliente = () => true;
const enServidor = () => false;

export default function PieZona() {
  const pais = paisDeRuta(usePathname() ?? "/");
  const montado = useSyncExternalStore(sinSuscripcion, enCliente, enServidor);
  return (
    <span key={montado ? "cliente" : "servidor"} suppressHydrationWarning>
      Datos con fuente verificable · Zona horaria {PAISES[pais].nombre}
    </span>
  );
}
