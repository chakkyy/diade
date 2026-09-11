import Link from "next/link";
import CompartirBoton from "@/components/CompartirBoton";
import EstadoHoy from "@/components/EstadoHoy";
import SelectorFecha from "@/components/SelectorFecha";
import {
  fechaAnterior,
  fechaSiguiente,
  formatearFechaLarga,
  slugDeFecha,
  type FechaDia,
} from "@/lib/fechas";

function Flecha({ direccion }: { direccion: "anterior" | "siguiente" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={direccion === "anterior" ? "-translate-x-px" : "translate-x-px"}
    >
      <path d={direccion === "anterior" ? "M14.5 5 7.5 12l7 7" : "M9.5 5l7 7-7 7"} />
    </svg>
  );
}

export default function DiaHeader({
  fecha,
  anio,
  esHoy,
}: {
  fecha: FechaDia;
  anio: number;
  esHoy: boolean | "auto";
}) {
  const titulo = formatearFechaLarga(fecha, anio);
  const anterior = slugDeFecha(fechaAnterior(fecha, anio));
  const siguiente = slugDeFecha(fechaSiguiente(fecha, anio));

  return (
    <div className="pt-7">
      {esHoy === "auto" ? (
        <EstadoHoy dia={fecha.dia} mes={fecha.mes} />
      ) : (
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${
              esHoy ? "text-acento-texto" : "text-texto-secundario"
            }`}
          >
            {esHoy ? "Hoy" : String(anio)}
          </p>
          {esHoy ? null : (
            <Link
              href="/"
              className="text-[13px] text-acento-texto underline-offset-2 hover:underline"
            >
              Ir a hoy
            </Link>
          )}
        </div>
      )}
      <h1 className="mt-1.5 text-[26px] leading-[1.12] font-semibold tracking-[-0.02em] sm:text-[32px]">
        {titulo}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/fecha/${anterior}`}
          aria-label="Día anterior"
          className="grid size-9 place-items-center rounded-[10px] border border-borde bg-superficie text-texto-secundario transition-colors duration-150 hover:text-texto"
        >
          <Flecha direccion="anterior" />
        </Link>
        <Link
          href={`/fecha/${siguiente}`}
          aria-label="Día siguiente"
          className="grid size-9 place-items-center rounded-[10px] border border-borde bg-superficie text-texto-secundario transition-colors duration-150 hover:text-texto"
        >
          <Flecha direccion="siguiente" />
        </Link>
        <SelectorFecha dia={fecha.dia} mes={fecha.mes} anio={anio} />
        <div className="ml-auto">
          <CompartirBoton titulo={`${titulo} · ¿Qué se celebra hoy?`} />
        </div>
      </div>
    </div>
  );
}
