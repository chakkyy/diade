"use client";

import { useEffect, useRef, type ReactNode, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import { decidirSwipe } from "@/lib/gestos";

const UMBRAL_PX = 60;
const SELECTOR_INTERACTIVO = "input, select, textarea, button, a, label, [contenteditable]";
const SELECTOR_ESCRITURA = "input, select, textarea, [contenteditable]";

export default function NavegacionDia({
  hrefAnterior,
  hrefSiguiente,
  children,
}: {
  hrefAnterior: string;
  hrefSiguiente: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const inicio = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.metaKey || evento.ctrlKey || evento.altKey || evento.shiftKey) return;
      if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
      const foco = document.activeElement;
      if (foco instanceof HTMLElement && foco.closest(SELECTOR_ESCRITURA)) return;
      evento.preventDefault();
      router.push(evento.key === "ArrowLeft" ? hrefAnterior : hrefSiguiente);
    }

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [router, hrefAnterior, hrefSiguiente]);

  function alTocar(evento: TouchEvent<HTMLDivElement>) {
    const objetivo = evento.target;
    if (objetivo instanceof HTMLElement && objetivo.closest(SELECTOR_INTERACTIVO)) {
      inicio.current = null;
      return;
    }
    const toque = evento.touches[0];
    inicio.current = { x: toque.clientX, y: toque.clientY };
  }

  function alSoltar(evento: TouchEvent<HTMLDivElement>) {
    const desde = inicio.current;
    inicio.current = null;
    if (desde === null) return;
    const toque = evento.changedTouches[0];
    const direccion = decidirSwipe({
      dx: toque.clientX - desde.x,
      dy: toque.clientY - desde.y,
      umbral: UMBRAL_PX,
    });
    if (direccion === null) return;
    router.push(direccion === "anterior" ? hrefAnterior : hrefSiguiente);
  }

  return (
    <div onTouchStart={alTocar} onTouchEnd={alSoltar}>
      {children}
    </div>
  );
}
