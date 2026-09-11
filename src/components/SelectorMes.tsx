"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { MESES, slugDeMes } from "@/lib/fechas";

export default function SelectorMes({ mes }: { mes: number }) {
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
          router.push(`/calendario/${slugDeMes(elegido)}`);
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
