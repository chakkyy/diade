import Link from "next/link";
import CompartirBoton from "@/components/CompartirBoton";
import EstadoHoy from "@/components/EstadoHoy";
import EtiquetaDia from "@/components/EtiquetaDia";
import SelectorFecha from "@/components/SelectorFecha";
import { IconoFlecha } from "@/components/iconos";
import {
  MESES,
  fechaAnterior,
  fechaSiguiente,
  formatearFechaLarga,
  nombreDiaSemana,
  slugDeFecha,
  type FechaDia,
} from "@/lib/fechas";

const ESTILO_BOTON =
  "grid size-9 place-items-center rounded-[10px] border border-borde bg-superficie text-texto-secundario transition-[color,transform] duration-150 hover:text-texto active:scale-[0.94]";

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
  const url = `/fecha/${slugDeFecha(fecha)}`;
  const anterior = slugDeFecha(fechaAnterior(fecha, anio));
  const siguiente = slugDeFecha(fechaSiguiente(fecha, anio));

  return (
    <div className="pt-6">
      {esHoy === "auto" ? (
        <EstadoHoy dia={fecha.dia} mes={fecha.mes} anio={anio} />
      ) : (
        <EtiquetaDia esHoy={esHoy} anio={anio} />
      )}
      <p className="mt-3 text-[13px] leading-4 font-medium text-texto-secundario">
        {nombreDiaSemana(fecha, anio)}
      </p>
      <h1 className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-[54px] leading-[0.88] font-semibold tracking-[-0.04em] tabular-nums sm:text-[64px]">
          {fecha.dia}
        </span>
        <span className="text-[20px] leading-7 font-medium tracking-[-0.01em] text-texto-secundario sm:text-[23px]">
          de {MESES[fecha.mes - 1]}
        </span>
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={`/fecha/${anterior}`}
          aria-label="Día anterior"
          title="Día anterior (flecha izquierda)"
          className={ESTILO_BOTON}
        >
          <IconoFlecha direccion="anterior" />
        </Link>
        <Link
          href={`/fecha/${siguiente}`}
          aria-label="Día siguiente"
          title="Día siguiente (flecha derecha)"
          className={ESTILO_BOTON}
        >
          <IconoFlecha direccion="siguiente" />
        </Link>
        <SelectorFecha dia={fecha.dia} mes={fecha.mes} anio={anio} />
        <div className="ml-auto">
          <CompartirBoton titulo={`${titulo} · ¿Qué se celebra hoy?`} url={url} />
        </div>
      </div>
    </div>
  );
}
