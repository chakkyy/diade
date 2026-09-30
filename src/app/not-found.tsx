import type { Metadata } from "next";
import EnlaceHoy from "@/components/EnlaceHoy";
import TrasHidratar from "@/components/TrasHidratar";

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
      <TrasHidratar>
        <EnlaceHoy />
      </TrasHidratar>
    </div>
  );
}
