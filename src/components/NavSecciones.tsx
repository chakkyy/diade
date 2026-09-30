"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoBuscar, IconoCalendario } from "@/components/iconos";
import { paisDeRuta, rutaDePais } from "@/lib/paises";

export default function NavSecciones() {
  const pais = paisDeRuta(usePathname() ?? "/");

  return (
    <>
      <Link
        href={rutaDePais(pais, "/")}
        className="mr-auto shrink-0 text-[13px] font-semibold tracking-tight sm:text-sm"
      >
        ¿Qué se celebra hoy?
      </Link>
      <nav aria-label="Secciones" className="hidden items-center gap-1 sm:flex">
        <Link
          href={rutaDePais(pais, "/calendario")}
          className="flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[13px] text-texto-secundario transition-colors duration-150 hover:bg-superficie-suave hover:text-texto"
        >
          <IconoCalendario />
          <span>Calendario</span>
        </Link>
        <Link
          href={rutaDePais(pais, "/buscar")}
          className="flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[13px] text-texto-secundario transition-colors duration-150 hover:bg-superficie-suave hover:text-texto"
        >
          <IconoBuscar />
          <span>Buscar</span>
        </Link>
      </nav>
    </>
  );
}
