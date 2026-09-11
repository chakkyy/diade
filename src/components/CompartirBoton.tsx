"use client";

import { useEffect, useRef, useState } from "react";

export default function CompartirBoton({ titulo, url }: { titulo: string; url?: string }) {
  const [copiado, setCopiado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  async function compartir() {
    const urlCompartible = url ? new URL(url, window.location.origin).href : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url: urlCompartible });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(urlCompartible);
      setCopiado(true);
      temporizador.current = setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={compartir}
      className="flex h-9 items-center gap-1.5 rounded-[10px] border border-borde bg-superficie px-2.5 text-[13px] text-texto-secundario transition-colors duration-150 hover:text-texto active:scale-[0.96]"
      style={{ transitionProperty: "color, background-color, scale" }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 16V4M8 7.5 12 3.5l4 4M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" />
      </svg>
      <span aria-live="polite">{copiado ? "Copiado" : "Compartir"}</span>
    </button>
  );
}
