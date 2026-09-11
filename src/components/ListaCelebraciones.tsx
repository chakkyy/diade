import Link from "next/link";
import CelebracionItem from "@/components/CelebracionItem";
import { agruparPorAlcance } from "@/lib/celebraciones";
import type { TonoBloque } from "@/components/EmojiTile";
import type { Celebracion } from "@/types/celebracion";

const TITULOS_BLOQUE: Record<TonoBloque, { emoji: string | null; texto: string }> = {
  argentina: { emoji: "🇦🇷", texto: "Argentina" },
  internacional: { emoji: "🌎", texto: "Internacional" },
  otros: { emoji: null, texto: "Otros países" },
};

const COLORES_PRINCIPAL: Record<TonoBloque, string> = {
  argentina: "text-acento-texto",
  internacional: "text-internacional-texto",
  otros: "text-texto",
};

function Bloque({
  tono,
  celebraciones,
  principal,
  desde,
}: {
  tono: TonoBloque;
  celebraciones: Celebracion[];
  principal: boolean;
  desde: number;
}) {
  if (celebraciones.length === 0) return null;

  const { emoji, texto } = TITULOS_BLOQUE[tono];

  return (
    <section className="mt-7 first:mt-0">
      <div className="flex items-baseline justify-between gap-3 px-1 pb-2">
        <h2
          className={`flex items-baseline gap-1.5 font-semibold tracking-[0.08em] uppercase ${
            principal ? `text-[12px] ${COLORES_PRINCIPAL[tono]}` : "text-[11px] text-texto-secundario"
          }`}
        >
          {emoji ? (
            <span aria-hidden="true">{emoji}</span>
          ) : null}
          {texto}
        </h2>
        <span className="text-[11px] tabular-nums text-texto-secundario">{celebraciones.length}</span>
      </div>
      <ul className="overflow-hidden rounded-caja border border-borde bg-superficie">
        {celebraciones.map((c, i) => (
          <CelebracionItem key={c.id} celebracion={c} indice={desde + i} />
        ))}
      </ul>
    </section>
  );
}

export default function ListaCelebraciones({ celebraciones }: { celebraciones: Celebracion[] }) {
  if (celebraciones.length === 0) {
    return (
      <div className="mt-7 rounded-caja border border-dashed border-borde-fuerte bg-superficie px-4 py-9 text-center">
        <p aria-hidden="true" className="text-[40px] leading-none">
          📭
        </p>
        <p className="mt-3 text-[16px] leading-6 font-medium">Este día está libre.</p>
        <p className="mx-auto mt-1 max-w-[30ch] text-[13px] leading-5 text-texto-secundario">
          No tenemos ninguna celebración anotada para esta fecha. Mirá lo que viene o buscá en todo el año.
        </p>
        <Link
          href="/buscar"
          className="mt-4 inline-flex h-9 items-center rounded-chip border border-acento-borde bg-acento-suave px-3.5 text-[13px] font-medium text-acento-texto transition-transform duration-150 active:scale-[0.96]"
        >
          Buscar en todo el año
        </Link>
      </div>
    );
  }

  const { argentina, internacional, otroPais } = agruparPorAlcance(celebraciones);
  const bloques: { tono: TonoBloque; lista: Celebracion[] }[] = [
    { tono: "argentina", lista: argentina },
    { tono: "internacional", lista: internacional },
    { tono: "otros", lista: otroPais },
  ];
  const primerBloqueConDatos = bloques.find(({ lista }) => lista.length > 0)?.tono;

  let acumulado = 0;

  return (
    <div className="mt-7">
      {bloques.map(({ tono, lista }) => {
        const desde = acumulado;
        acumulado += lista.length;
        return (
          <Bloque
            key={tono}
            tono={tono}
            celebraciones={lista}
            principal={tono === primerBloqueConDatos}
            desde={desde}
          />
        );
      })}
    </div>
  );
}
