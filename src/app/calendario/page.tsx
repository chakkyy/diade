import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendario",
  description: "El año completo de celebraciones, mes por mes.",
};

export default function PaginaCalendario() {
  return (
    <div className="pt-7">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
        Calendario
      </p>
      <h1 className="mt-1.5 text-[26px] leading-[1.12] font-semibold tracking-[-0.02em] sm:text-[32px]">
        El año completo
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-texto-secundario">Próximamente.</p>
    </div>
  );
}
