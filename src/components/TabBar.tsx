"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoBuscar, IconoCalendario, IconoHoy } from "@/components/iconos";
import { paisDeRuta, rutaDePais } from "@/lib/paises";

const SECCIONES = [
  { ruta: "/", etiqueta: "Hoy", Icono: IconoHoy, prefijos: ["/fecha"] },
  { ruta: "/calendario", etiqueta: "Calendario", Icono: IconoCalendario, prefijos: ["/calendario"] },
  { ruta: "/buscar", etiqueta: "Buscar", Icono: IconoBuscar, prefijos: ["/buscar"] },
];

export default function TabBar() {
  const pathname = usePathname() ?? "/";
  const pais = paisDeRuta(pathname);

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-fondo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:hidden"
    >
      <ul className="mx-auto flex w-full max-w-2xl">
        {SECCIONES.map(({ ruta, etiqueta, Icono, prefijos }) => {
          const href = rutaDePais(pais, ruta);
          const activa =
            pathname === href || prefijos.some((prefijo) => pathname.startsWith(rutaDePais(pais, prefijo)));
          return (
            <li key={ruta} className="flex-1">
              <Link
                href={href}
                aria-current={activa ? "page" : undefined}
                className={`flex h-[58px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-transform duration-150 active:scale-[0.93] ${
                  activa ? "text-acento-texto" : "text-texto-secundario"
                }`}
              >
                <span
                  className={`grid h-6 w-11 place-items-center rounded-chip transition-colors duration-150 ${
                    activa ? "bg-acento-suave" : "bg-transparent"
                  }`}
                >
                  <Icono tamanio={18} />
                </span>
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
