import Link from "next/link";
import CelebracionItem from "@/components/CelebracionItem";
import { agruparPorAlcance } from "@/lib/celebraciones";
import type { Celebracion } from "@/types/celebracion";

function Seccion({ titulo, celebraciones }: { titulo: string; celebraciones: Celebracion[] }) {
  if (celebraciones.length === 0) return null;

  return (
    <section className="mt-7 first:mt-0">
      <div className="flex items-baseline justify-between gap-3 px-1 pb-2">
        <h2 className="text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
          {titulo}
        </h2>
        <span className="text-[11px] tabular-nums text-texto-secundario">
          {celebraciones.length}
        </span>
      </div>
      <ul className="overflow-hidden rounded-caja border border-borde bg-superficie">
        {celebraciones.map((c) => (
          <CelebracionItem key={c.id} celebracion={c} />
        ))}
      </ul>
    </section>
  );
}

export default function ListaCelebraciones({
  celebraciones,
}: {
  celebraciones: Celebracion[];
  anio: number;
}) {
  if (celebraciones.length === 0) {
    return (
      <div className="mt-7 rounded-caja border border-dashed border-borde-fuerte bg-superficie px-4 py-8 text-center">
        <p className="text-[15px] leading-6">
          No tenemos celebraciones registradas para este día todavía.
        </p>
        <Link
          href="/buscar"
          className="mt-3 inline-block text-[13px] text-acento-texto underline underline-offset-2"
        >
          Buscar en todo el año
        </Link>
      </div>
    );
  }

  const { argentina, internacional, otroPais } = agruparPorAlcance(celebraciones);

  return (
    <div className="mt-7">
      <Seccion titulo="Argentina 🇦🇷" celebraciones={argentina} />
      <Seccion titulo="Internacional 🌎" celebraciones={internacional} />
      <Seccion titulo="Otros países" celebraciones={otroPais} />
    </div>
  );
}
