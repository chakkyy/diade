"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { slugDeFecha } from "@/lib/fechas";

export default function SelectorFecha({
  dia,
  mes,
  anio,
}: {
  dia: number;
  mes: number;
  anio: number;
}) {
  const router = useRouter();
  const id = useId();
  const valor = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  return (
    <div className="flex items-center">
      <label htmlFor={id} className="sr-only">
        Elegir una fecha
      </label>
      <input
        id={id}
        type="date"
        defaultValue={valor}
        min={`${anio}-01-01`}
        max={`${anio}-12-31`}
        onChange={(evento) => {
          const partes = evento.target.value.split("-");
          if (partes.length !== 3) return;
          const elegido = { dia: Number(partes[2]), mes: Number(partes[1]) };
          if (!elegido.dia || !elegido.mes) return;
          router.push(`/fecha/${slugDeFecha(elegido)}`);
        }}
        className="h-9 rounded-[10px] border border-borde bg-superficie px-2.5 text-[13px] text-texto-secundario transition-colors duration-150 hover:text-texto"
      />
    </div>
  );
}
