"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { IconoCheck, IconoChevron } from "@/components/iconos";
import { CODIGOS_PAIS, PAISES, busquedaParaPais, esClicSimple, paisDeRuta, rutaEnOtroPais } from "@/lib/paises";

export default function SelectorPais() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const idMenu = useId();
  const actual = paisDeRuta(pathname);
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn === pathname;
  const raiz = useRef<HTMLDivElement>(null);
  const disparador = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const foco = useRef<number | "ninguno">("ninguno");
  const [porTeclado, setPorTeclado] = useState(false);

  function setAbierto(valor: boolean) {
    setAbiertoEn(valor ? pathname : null);
  }

  function abrir(indice: number | "ninguno", teclado: boolean) {
    foco.current = indice;
    setPorTeclado(teclado);
    setAbierto(true);
  }

  function cerrar(devolverFoco: boolean) {
    setAbierto(false);
    if (devolverFoco) disparador.current?.focus();
  }

  useEffect(() => {
    if (!abierto) return;
    if (foco.current !== "ninguno") items.current[foco.current]?.focus();
    function alPresionar(evento: PointerEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAbiertoEn(null);
    }
    document.addEventListener("pointerdown", alPresionar);
    return () => document.removeEventListener("pointerdown", alPresionar);
  }, [abierto]);

  function alTeclearDisparador(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      if (abierto) {
        items.current[evento.key === "ArrowUp" ? CODIGOS_PAIS.length - 1 : 0]?.focus();
        return;
      }
      abrir(evento.key === "ArrowUp" ? CODIGOS_PAIS.length - 1 : CODIGOS_PAIS.indexOf(actual), true);
    }
  }

  function alTeclearRaiz(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "Escape" || !abierto) return;
    evento.preventDefault();
    cerrar(true);
  }

  function alTeclearMenu(evento: KeyboardEvent<HTMLDivElement>) {
    const total = CODIGOS_PAIS.length;
    const indice = items.current.findIndex((item) => item === document.activeElement);
    let destino: number | null = null;
    if (evento.key === "ArrowDown") destino = (indice + 1) % total;
    else if (evento.key === "ArrowUp") destino = (indice - 1 + total) % total;
    else if (evento.key === "Home") destino = 0;
    else if (evento.key === "End") destino = total - 1;
    else if (evento.key === "Tab") {
      setAbierto(false);
      return;
    }
    if (destino === null) return;
    evento.preventDefault();
    items.current[destino]?.focus();
  }

  const { bandera, nombre, codigo } = PAISES[actual];

  return (
    <div ref={raiz} onKeyDown={alTeclearRaiz} className="relative shrink-0">
      <button
        ref={disparador}
        type="button"
        aria-label="País"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={idMenu}
        onClick={(evento) => {
          if (abierto) cerrar(false);
          else abrir(evento.detail === 0 ? CODIGOS_PAIS.indexOf(actual) : "ninguno", evento.detail === 0);
        }}
        onKeyDown={alTeclearDisparador}
        className="flex h-10 items-center gap-1.5 rounded-[10px] border border-borde bg-superficie pr-2 pl-2.5 text-[13px] font-medium transition-[background-color,transform] duration-150 hover:bg-superficie-suave active:scale-[0.96]"
      >
        <span aria-hidden="true" suppressHydrationWarning className="text-[16px] leading-none">
          {bandera}
        </span>
        <span suppressHydrationWarning className="min-[360px]:hidden">{codigo.toUpperCase()}</span>
        <span suppressHydrationWarning className="hidden min-[360px]:inline">{nombre}</span>
        <IconoChevron
          className={`text-texto-secundario transition-transform duration-150 ease-out motion-reduce:transition-none ${abierto ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={idMenu}
        role="menu"
        aria-label="País"
        data-abierto={abierto}
        data-teclado={porTeclado}
        onKeyDown={alTeclearMenu}
        className="menu-pais absolute top-full right-0 z-30 mt-1.5 min-w-44 origin-top-right rounded-caja border border-borde bg-superficie p-1 shadow-[0_4px_16px_rgb(0_0_0/0.06)]"
      >
        {CODIGOS_PAIS.map((codigoItem, indice) => {
          const pais = PAISES[codigoItem];
          const href = rutaEnOtroPais(pathname, codigoItem);
          const activo = codigoItem === actual;
          return (
            <Link
              key={codigoItem}
              ref={(nodo) => {
                items.current[indice] = nodo;
              }}
              href={href}
              role="menuitemradio"
              aria-checked={activo}
              aria-label={pais.nombre}
              aria-current={activo ? "true" : undefined}
              tabIndex={-1}
              onClick={(evento) => {
                if (!esClicSimple(evento)) return;
                cerrar(codigoItem === actual);
                const busqueda = busquedaParaPais(window.location.search, codigoItem);
                if (busqueda === "") return;
                evento.preventDefault();
                router.push(`${href}${busqueda}`);
              }}
              className={`flex h-11 items-center gap-2.5 rounded-[8px] px-2.5 text-[14px] transition-colors duration-150 focus-visible:bg-superficie-suave ${
                activo ? "bg-acento-suave font-medium text-acento-texto" : "hover:bg-superficie-suave"
              }`}
            >
              <span aria-hidden="true" className="text-[18px] leading-none">
                {pais.bandera}
              </span>
              <span aria-hidden="true" className="mr-auto">
                {pais.nombre}
              </span>
              <span className={activo ? undefined : "invisible"}>
                <IconoCheck />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
