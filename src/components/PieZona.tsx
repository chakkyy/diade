"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PAISES, paisDeRuta } from "@/lib/paises";

export default function PieZona() {
  const pais = paisDeRuta(usePathname() ?? "/");
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  return (
    <span key={montado ? "cliente" : "servidor"} suppressHydrationWarning>
      Datos con fuente verificable · Zona horaria {PAISES[pais].nombre}
    </span>
  );
}
