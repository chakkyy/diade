import Link from "next/link";
import { celdasDelMes } from "@/lib/calendario";
import { MESES, slugDeFecha, type FechaDia } from "@/lib/fechas";

interface ConteoDia {
  total: number;
  argentina: number;
  internacional: number;
  otroPais: number;
}

const DIAS_SEMANA_ABREVIADOS: { corto: string; completo: string }[] = [
  { corto: "lun", completo: "lunes" },
  { corto: "mar", completo: "martes" },
  { corto: "mié", completo: "miércoles" },
  { corto: "jue", completo: "jueves" },
  { corto: "vie", completo: "viernes" },
  { corto: "sáb", completo: "sábado" },
  { corto: "dom", completo: "domingo" },
];

export default function CalendarioMes({
  mes,
  anio,
  conteos,
  hoy,
}: {
  mes: number;
  anio: number;
  conteos: Map<number, ConteoDia>;
  hoy: FechaDia | null;
}) {
  const celdas = celdasDelMes(mes, anio);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-7 gap-1 px-0.5 pb-1.5 text-center text-[11px] font-medium text-texto-secundario">
        {DIAS_SEMANA_ABREVIADOS.map(({ corto, completo }) => (
          <abbr key={completo} title={completo} className="no-underline">
            {corto}
          </abbr>
        ))}
      </div>
      <ul role="list" className="grid grid-cols-7 gap-1">
        {celdas.map((dia, indice) => {
          if (dia === null) {
            return <li key={`vacia-${indice}`} aria-hidden="true" />;
          }

          const conteo = conteos.get(dia);
          const esHoy = hoy !== null && hoy.dia === dia && hoy.mes === mes;
          const nombreMes = MESES[mes - 1];
          const label =
            conteo && conteo.total > 0
              ? `${dia} de ${nombreMes}, ${conteo.total} ${conteo.total === 1 ? "celebración" : "celebraciones"}`
              : `${dia} de ${nombreMes}, sin celebraciones`;

          return (
            <li key={dia}>
              <Link
                href={`/fecha/${slugDeFecha({ dia, mes })}`}
                aria-label={label}
                className={`flex aspect-square min-h-11 flex-col items-center justify-center gap-0.5 rounded-[10px] border transition-colors duration-150 ${
                  esHoy
                    ? "border-acento bg-acento-suave"
                    : "border-borde bg-superficie hover:border-borde-fuerte"
                }`}
              >
                <span
                  className={`text-[13px] leading-4 font-medium ${
                    esHoy ? "text-acento-texto" : conteo ? "text-texto" : "text-texto-secundario"
                  }`}
                >
                  {dia}
                </span>
                {conteo && conteo.total > 0 ? (
                  <>
                    <span className="flex items-center gap-[3px]" aria-hidden="true">
                      {conteo.argentina > 0 ? (
                        <span className="size-[5px] rounded-full bg-acento" />
                      ) : null}
                      {conteo.internacional > 0 ? (
                        <span className="size-[5px] rounded-full bg-borde-fuerte" />
                      ) : null}
                      {conteo.otroPais > 0 ? (
                        <span className="size-[5px] rounded-full border border-borde-fuerte" />
                      ) : null}
                    </span>
                    <span className="text-[10px] leading-3 text-texto-secundario" aria-hidden="true">
                      {conteo.total}
                    </span>
                  </>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-texto-secundario">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-[5px] rounded-full bg-acento" />
          Argentina
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-[5px] rounded-full bg-borde-fuerte" />
          Internacional
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-[5px] rounded-full border border-borde-fuerte" />
          Otros países
        </li>
      </ul>
    </div>
  );
}
