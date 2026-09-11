import Link from "next/link";
import type { CSSProperties } from "react";
import CategoriaChip from "@/components/CategoriaChip";
import Chip from "@/components/Chip";
import EmojiTile, { tonoDeAlcance, type TonoBloque } from "@/components/EmojiTile";
import { nombreCortoFuente } from "@/lib/fuentes";
import type { Celebracion, Fuente } from "@/types/celebracion";

const BORDES_DESTACADO: Record<TonoBloque, string> = {
  argentina: "border-l-acento",
  internacional: "border-l-internacional-texto",
  otros: "border-l-borde-fuerte",
};

function fuentePrincipal(fuentes: Fuente[]): Fuente | undefined {
  return fuentes.find((f) => f.tipo !== "secundaria") ?? fuentes[0];
}

export default function CelebracionItem({
  celebracion,
  indice = 0,
}: {
  celebracion: Celebracion;
  indice?: number;
}) {
  const fuente = fuentePrincipal(celebracion.fuentes);
  const tono = tonoDeAlcance(celebracion.alcance);
  const borde = celebracion.destacado ? BORDES_DESTACADO[tono] : "border-l-transparent";

  return (
    <li
      style={{ "--fila": indice } as CSSProperties}
      className={`fila-entra border-b border-b-borde border-l-[3px] transition-colors duration-150 last:border-b-0 active:bg-superficie-suave ${borde}`}
    >
      <div className="flex gap-3 px-3.5 py-3">
        <EmojiTile emoji={celebracion.emoji} tono={tono} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <Link
              href={`/celebracion/${celebracion.id}`}
              className="text-[15px] leading-6 font-medium tracking-tight underline-offset-2 hover:underline hover:decoration-acento active:opacity-70"
            >
              {celebracion.destacado ? <span className="sr-only">Destacado: </span> : null}
              {celebracion.nombre}
            </Link>
            <CategoriaChip categoria={celebracion.categoria} />
            {celebracion.alcance === "otro-pais" && celebracion.pais ? (
              <Chip titulo={`País: ${celebracion.pais}`}>{celebracion.pais}</Chip>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.5] text-texto-secundario">
            {celebracion.descripcion}
          </p>
          {fuente ? (
            <a
              href={fuente.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex max-w-full items-center gap-1 text-[12px] leading-5 text-texto-secundario transition-colors duration-150 hover:text-acento-texto active:opacity-70"
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
}
