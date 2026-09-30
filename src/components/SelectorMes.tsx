"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { MESES, slugDeMes } from "@/lib/fechas";
import { rutaDePais, type CodigoPais } from "@/lib/paises";

export default function SelectorMes({ mes, pais }: { mes: number; pais: CodigoPais }) {
  const router = useRouter();
  const id = useId();

  return (
    <div className="flex items-center">
      <label htmlFor={id} className="sr-only">
        Elegir un mes
      </label>
      <select
        id={id}
        defaultValue={String(mes)}
        onChange={(evento) => {
          const elegido = Number(evento.target.value);
          if (!elegido) return;
          router.push(rutaDePais(pais, `/calendario/${slugDeMes(elegido)}`));
        }}
        className="h-9 rounded-[10px] border border-borde bg-superficie px-2.5 text-[13px] text-texto-secundario capitalize transition-colors duration-150 hover:text-texto"
      >
        {MESES.map((nombre, indice) => (
          <option key={nombre} value={indice + 1}>
            {nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
