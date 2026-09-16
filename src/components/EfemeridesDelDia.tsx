import { agruparEfemerides } from "@/lib/efemerides";
import { nombreCortoFuente } from "@/lib/fuentes";
import type { Efemeride } from "@/types/efemeride";

function formatearAnio(anio: number): string {
  return anio < 0 ? `${-anio} a. C.` : String(anio);
}

const TITULOS_BLOQUE: Record<Efemeride["alcance"], { emoji: string; texto: string; clase: string }> = {
  argentina: { emoji: "🇦🇷", texto: "Argentina", clase: "text-acento-texto" },
  internacional: { emoji: "🌎", texto: "Internacional", clase: "text-internacional-texto" },
};

function Bloque({ alcance, efemerides }: { alcance: Efemeride["alcance"]; efemerides: Efemeride[] }) {
  if (efemerides.length === 0) return null;
  const { emoji, texto, clase } = TITULOS_BLOQUE[alcance];

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-baseline justify-between gap-3 px-1 pb-1.5">
        <h3 className={`flex items-baseline gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase ${clase}`}>
          <span aria-hidden="true">{emoji}</span>
          {texto}
        </h3>
        <span className="text-[11px] tabular-nums text-texto-secundario">{efemerides.length}</span>
      </div>
      <ul className="overflow-hidden rounded-caja border border-borde bg-superficie">
        {efemerides.map((e) => {
          const esArgentina = e.alcance === "argentina";
          const fuente = e.fuentes[0];
          return (
            <li key={e.id} className="border-b border-borde last:border-b-0">
              <div className="flex gap-3 px-3.5 py-2.5">
                <span
                  className={`flex min-w-11 shrink-0 items-baseline gap-1 text-[13px] leading-5 font-semibold tabular-nums ${
                    esArgentina ? "text-acento-texto" : "text-texto-secundario"
                  }`}
                >
                  {formatearAnio(e.anio)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-5">{e.texto}</p>
                  {fuente ? (
                    <a
                      href={fuente.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 text-[12px] leading-5 text-texto-secundario transition-colors duration-150 hover:text-acento-texto active:opacity-70"
                    >
                      <span className="truncate underline decoration-borde-fuerte underline-offset-2">
                        Fuente: {nombreCortoFuente(fuente.nombre)}
                      </span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="shrink-0"
                      >
                        <path d="M7 17 17 7M8 7h9v9" />
                      </svg>
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function EfemeridesDelDia({ efemerides }: { efemerides: Efemeride[] }) {
  if (efemerides.length === 0) return null;
  const { argentina, internacional } = agruparEfemerides(efemerides);

  return (
    <section className="mt-8">
      <h2 className="px-1 pb-2 text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
        Efemérides del día
      </h2>
      <Bloque alcance="argentina" efemerides={argentina} />
      <Bloque alcance="internacional" efemerides={internacional} />
    </section>
  );
}
