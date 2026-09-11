import { ETIQUETAS_ALCANCE, ETIQUETAS_CATEGORIA } from "@/lib/buscar";
import { ALCANCES, CATEGORIAS } from "@/types/celebracion";
import type { Alcance, Categoria } from "@/types/celebracion";

function ChipToggle({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center rounded-chip border px-2.5 py-1 text-[12px] leading-[18px] font-medium whitespace-nowrap transition-colors duration-150 ${
        activo
          ? "border-acento-borde bg-acento-suave text-acento-texto"
          : "border-borde bg-superficie-suave text-texto-secundario hover:text-texto"
      }`}
    >
      {children}
    </button>
  );
}

export default function Filtros({
  alcance,
  categoria,
  onToggleAlcance,
  onToggleCategoria,
}: {
  alcance: Alcance[];
  categoria: Categoria[];
  onToggleAlcance: (valor: Alcance) => void;
  onToggleCategoria: (valor: Categoria) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div role="group" aria-label="Filtrar por alcance" className="flex flex-wrap gap-2">
        {ALCANCES.map((valor) => (
          <ChipToggle key={valor} activo={alcance.includes(valor)} onClick={() => onToggleAlcance(valor)}>
            {ETIQUETAS_ALCANCE[valor]}
          </ChipToggle>
        ))}
      </div>
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
      >
        {CATEGORIAS.map((valor) => (
          <ChipToggle key={valor} activo={categoria.includes(valor)} onClick={() => onToggleCategoria(valor)}>
            {ETIQUETAS_CATEGORIA[valor]}
          </ChipToggle>
        ))}
      </div>
    </div>
  );
}
