import type { Alcance } from "@/types/celebracion";
import { grupoDeAlcance, type CodigoPais, type GrupoAlcance } from "@/lib/paises";

export type TonoBloque = GrupoAlcance;

const FONDOS: Record<TonoBloque, string> = {
  local: "bg-acento-suave",
  internacional: "bg-internacional-suave",
  otros: "bg-superficie-suave",
};

const TAMANIOS = {
  md: "size-10 rounded-[11px] text-[20px]",
  sm: "size-8 rounded-[9px] text-[16px]",
} as const;

export function tonoDeAlcance(alcance: Alcance, pais: CodigoPais): TonoBloque {
  return grupoDeAlcance(alcance, pais);
}

export default function EmojiTile({
  emoji,
  tono = "otros",
  tamanio = "md",
}: {
  emoji?: string;
  tono?: TonoBloque;
  tamanio?: keyof typeof TAMANIOS;
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center leading-none ${TAMANIOS[tamanio]} ${FONDOS[tono]}`}
    >
      {emoji ?? <span className="size-[5px] rounded-full bg-borde-fuerte" />}
    </span>
  );
}
