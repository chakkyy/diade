import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NoEncontrada() {
  return (
    <div className="pt-7">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
        Error 404
      </p>
      <h1 className="mt-1.5 text-[26px] leading-[1.12] font-semibold tracking-[-0.02em] sm:text-[32px]">
        Esta página no existe
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-texto-secundario">
        La fecha que buscabas no está en el calendario. Puede ser un día que no existe, como el 31 de
        septiembre.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex h-9 items-center rounded-[10px] border border-borde bg-superficie px-3 text-[13px] font-medium text-acento-texto transition-colors duration-150 hover:bg-superficie-suave"
      >
        Ver qué se celebra hoy
      </Link>
    </div>
  );
}
