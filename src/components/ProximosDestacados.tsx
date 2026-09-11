import Link from "next/link";
import EmojiTile, { tonoDeAlcance } from "@/components/EmojiTile";
import { textoEnDias, type ProximoDestacado } from "@/lib/proximos";
import { formatearFechaCorta, slugDeFecha } from "@/lib/fechas";

export default function ProximosDestacados({ proximos }: { proximos: ProximoDestacado[] }) {
  if (proximos.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="px-1 pb-2 text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
        Próximos
      </h2>
      <ul className="overflow-hidden rounded-caja border border-borde bg-superficie">
        {proximos.map(({ celebracion, fecha, enDias }) => (
          <li key={celebracion.id} className="border-b border-borde last:border-b-0">
            <Link
              href={`/fecha/${slugDeFecha(fecha)}`}
              className="flex items-center gap-3 px-3.5 py-2.5 transition-colors duration-150 active:bg-superficie-suave"
            >
              <EmojiTile
                emoji={celebracion.emoji}
                tono={tonoDeAlcance(celebracion.alcance)}
                tamanio="sm"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] leading-5 font-medium">
                  {celebracion.nombre}
                </span>
                <span className="block text-[12px] leading-5 text-texto-secundario">
                  {textoEnDias(enDias)} · {formatearFechaCorta(fecha)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
