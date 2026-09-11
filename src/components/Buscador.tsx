"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import CategoriaChip from "@/components/CategoriaChip";
import Chip from "@/components/Chip";
import EmojiTile, { tonoDeAlcance } from "@/components/EmojiTile";
import Filtros from "@/components/Filtros";
import { escribirFiltros, type FiltrosUrl } from "@/lib/buscar-url";
import { buscar, ETIQUETAS_ALCANCE } from "@/lib/buscar";
import { describirFecha } from "@/lib/fechas-texto";
import { resolverFechaMovil, slugDeFecha } from "@/lib/fechas";
import { esFechaMovil } from "@/types/celebracion";
import type { Alcance, Categoria, ItemIndice } from "@/types/celebracion";

const TAMANIO_PAGINA = 30;
const DEMORA_TEXTO_MS = 250;

function etiquetaAlcance(item: ItemIndice): string {
  if (item.alcance === "otro-pais" && item.pais) return item.pais;
  return ETIQUETAS_ALCANCE[item.alcance];
}

function ResultadoFila({ item, anio }: { item: ItemIndice; anio: number }) {
  const fechaResuelta = esFechaMovil(item.fecha) ? resolverFechaMovil(item.fecha, anio) : item.fecha;
  const slug = slugDeFecha(fechaResuelta);
  const fechaTexto = describirFecha(item.fecha, anio);

  return (
    <li className="border-b border-borde transition-colors duration-150 last:border-b-0 active:bg-superficie-suave">
      <div className="flex items-start gap-3 px-3.5 py-3">
        <EmojiTile emoji={item.emoji} tono={tonoDeAlcance(item.alcance)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <Link
              href={`/celebracion/${item.id}`}
              className="text-[15px] leading-6 font-medium tracking-tight underline-offset-2 hover:underline hover:decoration-acento active:opacity-70"
            >
              {item.nombre}
            </Link>
            <Link
              href={`/fecha/${slug}`}
              className="shrink-0 text-[12px] leading-6 text-texto-secundario underline-offset-2 transition-colors duration-150 hover:text-acento-texto hover:underline active:opacity-70"
            >
              {fechaTexto}
            </Link>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <CategoriaChip categoria={item.categoria} />
            <Chip>{etiquetaAlcance(item)}</Chip>
          </div>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-texto-secundario">{item.descripcion}</p>
        </div>
      </div>
    </li>
  );
}

export default function Buscador({
  indice,
  inicial,
  anio,
}: {
  indice: ItemIndice[];
  inicial: FiltrosUrl;
  anio: number;
}) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [q, setQ] = useState(inicial.q);
  const [alcance, setAlcance] = useState<Alcance[]>(inicial.alcance);
  const [categoria, setCategoria] = useState<Categoria[]>(inicial.categoria);
  const [visibles, setVisibles] = useState(TAMANIO_PAGINA);

  const [claveInicialAplicada, setClaveInicialAplicada] = useState(() => escribirFiltros(inicial));
  const claveInicialActual = escribirFiltros(inicial);
  if (claveInicialActual !== claveInicialAplicada) {
    setClaveInicialAplicada(claveInicialActual);
    setQ(inicial.q);
    setAlcance(inicial.alcance);
    setCategoria(inicial.categoria);
  }

  const claveFiltros = `${q}|${alcance.join(",")}|${categoria.join(",")}`;
  const [claveAnterior, setClaveAnterior] = useState(claveFiltros);

  if (claveFiltros !== claveAnterior) {
    setClaveAnterior(claveFiltros);
    setVisibles(TAMANIO_PAGINA);
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (window.matchMedia("(min-width: 640px)").matches) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function actualizarUrl(filtros: FiltrosUrl, inmediato: boolean) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const escribir = () => {
      const qs = escribirFiltros(filtros);
      router.replace(qs === "" ? "/buscar" : `/buscar?${qs}`, { scroll: false });
    };
    if (inmediato) escribir();
    else debounceRef.current = setTimeout(escribir, DEMORA_TEXTO_MS);
  }

  function alCambiarTexto(valor: string) {
    setQ(valor);
    actualizarUrl({ q: valor, alcance, categoria }, false);
  }

  function alLimpiar() {
    setQ("");
    actualizarUrl({ q: "", alcance, categoria }, true);
    inputRef.current?.focus();
  }

  function alternarAlcance(valor: Alcance) {
    const siguiente = alcance.includes(valor) ? alcance.filter((a) => a !== valor) : [...alcance, valor];
    setAlcance(siguiente);
    actualizarUrl({ q, alcance: siguiente, categoria }, true);
  }

  function alternarCategoria(valor: Categoria) {
    const siguiente = categoria.includes(valor) ? categoria.filter((c) => c !== valor) : [...categoria, valor];
    setCategoria(siguiente);
    actualizarUrl({ q, alcance, categoria: siguiente }, true);
  }

  const resultados = useMemo(
    () =>
      buscar(indice, q, {
        alcance: alcance.length > 0 ? alcance : undefined,
        categoria: categoria.length > 0 ? categoria : undefined,
      }),
    [indice, q, alcance, categoria],
  );

  const sinFiltros = q.trim() === "" && alcance.length === 0 && categoria.length === 0;
  const visibles_ = resultados.slice(0, visibles);
  const quedanMas = resultados.length > visibles_.length;

  return (
    <div className="pt-7">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">Buscar</p>
      <h1 className="mt-1.5 text-[26px] leading-[1.12] font-semibold tracking-[-0.02em] sm:text-[32px]">
        Buscar una celebración
      </h1>

      <div className="mt-4">
        <label htmlFor={inputId} className="sr-only">
          Buscar celebraciones
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={q}
            placeholder="Buscar: fotógrafo, perro, maestro…"
            onChange={(evento) => alCambiarTexto(evento.target.value)}
            className="h-11 w-full rounded-caja border border-borde bg-superficie px-3.5 pr-16 text-[15px] text-texto placeholder:text-texto-secundario"
          />
          {q !== "" ? (
            <button
              type="button"
              onClick={alLimpiar}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-[8px] px-2 py-1 text-[12px] text-texto-secundario transition-colors duration-150 hover:text-texto active:opacity-70"
            >
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      <Filtros
        alcance={alcance}
        categoria={categoria}
        onToggleAlcance={alternarAlcance}
        onToggleCategoria={alternarCategoria}
      />

      <p aria-live="polite" className="mt-5 text-[13px] text-texto-secundario">
        {sinFiltros ? `Todas las celebraciones (${resultados.length})` : `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}`}
      </p>

      {resultados.length === 0 ? (
        <div className="mt-3 rounded-caja border border-dashed border-borde-fuerte bg-superficie px-4 py-8 text-center">
          <p aria-hidden="true" className="text-[36px] leading-none">
            🔎
          </p>
          <p className="mt-3 text-[15px] leading-6">
            {q.trim() === ""
              ? "Sin resultados. Probá con otra palabra o sacá un filtro."
              : `Sin resultados para «${q.trim()}». Probá con otra palabra o sacá un filtro.`}
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-3 overflow-hidden rounded-caja border border-borde bg-superficie">
            {visibles_.map((item) => (
              <ResultadoFila key={item.id} item={item} anio={anio} />
            ))}
          </ul>
          {quedanMas ? (
            <button
              type="button"
              onClick={() => setVisibles((actual) => actual + TAMANIO_PAGINA)}
              className="mt-3 w-full rounded-caja border border-borde bg-superficie py-2.5 text-[13px] text-texto-secundario transition-[color,transform] duration-150 hover:text-texto active:scale-[0.99]"
            >
              Mostrar más
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
