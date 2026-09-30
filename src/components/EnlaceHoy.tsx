"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { paisDeRuta, rutaDePais } from "@/lib/paises";

export default function EnlaceHoy() {
  const pais = paisDeRuta(usePathname() ?? "/");
  return (
    <Link
      href={rutaDePais(pais, "/")}
      className="mt-5 inline-flex h-9 items-center rounded-[10px] border border-borde bg-superficie px-3 text-[13px] font-medium text-acento-texto transition-colors duration-150 hover:bg-superficie-suave"
    >
      Ver qué se celebra hoy
    </Link>
  );
}
