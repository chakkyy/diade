import Link from "next/link";
import CategoriaChip from "@/components/CategoriaChip";
import Chip from "@/components/Chip";
import type { Celebracion, Fuente } from "@/types/celebracion";

function fuentePrincipal(fuentes: Fuente[]): Fuente | undefined {
  return fuentes.find((f) => f.tipo !== "secundaria") ?? fuentes[0];
}

export default function CelebracionItem({ celebracion }: { celebracion: Celebracion }) {
  const fuente = fuentePrincipal(celebracion.fuentes);

  return (
    <li className="border-b border-borde last:border-b-0">
      <div className="flex gap-3 px-3.5 py-3.5">
        <span aria-hidden="true" className="w-6 shrink-0 text-center text-[17px] leading-6">
          {celebracion.emoji ?? (
            <span className="inline-block size-[5px] translate-y-[-3px] rounded-full bg-borde-fuerte align-middle" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <Link
              href={`/celebracion/${celebracion.id}`}
              className="text-[15px] leading-6 font-medium tracking-tight underline-offset-2 hover:underline hover:decoration-acento"
            >
              {celebracion.nombre}
            </Link>
            <CategoriaChip categoria={celebracion.categoria} />
            {celebracion.alcance === "otro-pais" && celebracion.pais ? (
              <Chip titulo={`País: ${celebracion.pais}`}>{celebracion.pais}</Chip>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.5] text-texto-secundario sm:line-clamp-none">
            {celebracion.descripcion}
          </p>
          {fuente ? (
            <a
              href={fuente.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex max-w-full items-center gap-1 text-[12px] leading-5 text-texto-secundario transition-colors duration-150 hover:text-acento-texto"
            >
              <span className="truncate underline decoration-borde-fuerte underline-offset-2">
                {fuente.nombre}
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
