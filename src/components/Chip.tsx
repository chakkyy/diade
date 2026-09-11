import type { ReactNode } from "react";

export type VarianteChip = "neutral" | "accent";

const ESTILOS: Record<VarianteChip, string> = {
  neutral: "border-borde bg-superficie-suave text-texto-secundario",
  accent: "border-acento-borde bg-acento-suave text-acento-texto",
};

export default function Chip({
  children,
  variante = "neutral",
  titulo,
}: {
  children: ReactNode;
  variante?: VarianteChip;
  titulo?: string;
}) {
  return (
    <span
      title={titulo}
      className={`inline-flex shrink-0 items-center rounded-chip border px-2 py-[1px] text-[11px] leading-[18px] font-medium whitespace-nowrap ${ESTILOS[variante]}`}
    >
      {children}
    </span>
  );
}
