"use client";

import { useSyncExternalStore } from "react";

function guardarTema(valor: string): boolean {
  try {
    window.localStorage.setItem("theme", valor);
    return true;
  } catch {
    return false;
  }
}

function suprimirTransiciones(): () => void {
  const estilo = document.createElement("style");
  estilo.textContent = "*,*::before,*::after{transition:none !important}";
  document.head.appendChild(estilo);
  return () => {
    document.body.getBoundingClientRect();
    requestAnimationFrame(() => estilo.remove());
  };
}

function suscribirAlTema(alCambiar: () => void): () => void {
  const observador = new MutationObserver(alCambiar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observador.disconnect();
}

function leerTemaCliente(): boolean {
  return document.documentElement.classList.contains("dark");
}

function leerTemaServidor(): boolean {
  return false;
}

export default function ThemeToggle() {
  const oscuro = useSyncExternalStore(suscribirAlTema, leerTemaCliente, leerTemaServidor);

  function alternar() {
    const siguiente = !oscuro;
    const restaurar = suprimirTransiciones();
    const raiz = document.documentElement;
    raiz.classList.toggle("dark", siguiente);
    raiz.classList.toggle("light", !siguiente);
    guardarTema(siguiente ? "dark" : "light");
    restaurar();
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Tema oscuro"
      aria-pressed={oscuro}
      className="relative grid size-8 shrink-0 place-items-center rounded-[10px] text-texto-secundario transition-[color,background-color,transform] duration-150 hover:bg-superficie-suave hover:text-texto active:scale-[0.92]"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="col-start-1 row-start-1 [transition:opacity_200ms_cubic-bezier(0.2,0,0,1),scale_200ms_cubic-bezier(0.2,0,0,1),filter_200ms_cubic-bezier(0.2,0,0,1)]"
        style={
          oscuro
            ? { opacity: 0, scale: "0.25", filter: "blur(4px)" }
            : { opacity: 1, scale: "1", filter: "blur(0px)" }
        }
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="col-start-1 row-start-1 [transition:opacity_200ms_cubic-bezier(0.2,0,0,1),scale_200ms_cubic-bezier(0.2,0,0,1),filter_200ms_cubic-bezier(0.2,0,0,1)]"
        style={
          oscuro
            ? { opacity: 1, scale: "1", filter: "blur(0px)" }
            : { opacity: 0, scale: "0.25", filter: "blur(4px)" }
        }
      >
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
