import Link from "next/link";
import { rutaDePais, type CodigoPais } from "@/lib/paises";

export default function EtiquetaDia({ esHoy, anio, pais }: { esHoy: boolean; anio: number; pais: CodigoPais }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {esHoy ? (
        <span className="inline-flex items-center rounded-chip border border-acento-borde bg-acento-suave px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.08em] text-acento-texto uppercase">
          Hoy
        </span>
      ) : (
        <span className="text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
          {String(anio)}
        </span>
      )}
      {esHoy ? null : (
        <Link
          href={rutaDePais(pais, "/")}
          className="text-[13px] text-acento-texto underline-offset-2 hover:underline active:opacity-70"
        >
          Ir a hoy
        </Link>
      )}
    </div>
  );
}
