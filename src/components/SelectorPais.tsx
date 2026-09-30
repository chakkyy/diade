"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CODIGOS_PAIS, PAISES, busquedaParaPais, esClicSimple, paisDeRuta, rutaEnOtroPais } from "@/lib/paises";

export default function SelectorPais() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const actual = paisDeRuta(pathname);

  return (
    <nav aria-label="País" className="flex items-center rounded-[10px] border border-borde bg-superficie p-0.5">
      {CODIGOS_PAIS.map((codigo) => {
        const { bandera, nombre } = PAISES[codigo];
        const href = rutaEnOtroPais(pathname, codigo);
        const activo = codigo === actual;
        return (
          <Link
            key={codigo}
            href={href}
            aria-label={nombre}
            title={nombre}
            aria-current={activo ? "true" : undefined}
            onClick={(evento) => {
              if (!esClicSimple(evento)) return;
              const busqueda = busquedaParaPais(window.location.search, codigo);
              if (busqueda === "") return;
              evento.preventDefault();
              router.push(`${href}${busqueda}`);
            }}
            className={`grid h-8 w-9 place-items-center rounded-[8px] text-[16px] leading-none transition-colors duration-150 ${
              activo ? "bg-acento-suave" : "opacity-60 hover:opacity-100"
            }`}
          >
            <span aria-hidden="true">{bandera}</span>
          </Link>
        );
      })}
    </nav>
  );
}
