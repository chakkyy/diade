"use client";

import { usePathname } from "next/navigation";
import { PAISES, paisDeRuta } from "@/lib/paises";

export default function PieZona() {
  const pais = paisDeRuta(usePathname() ?? "/");
  return <span suppressHydrationWarning>Datos con fuente verificable · Zona horaria {PAISES[pais].nombre}</span>;
}
