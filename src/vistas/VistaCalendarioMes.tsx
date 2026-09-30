import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CalendarioMes from "@/components/CalendarioMes";
import CategoriaChip from "@/components/CategoriaChip";
import Chip from "@/components/Chip";
import EmojiTile, { tonoDeAlcance } from "@/components/EmojiTile";
import SelectorMes from "@/components/SelectorMes";
import { IconoFlecha } from "@/components/iconos";
import { etiquetaDeAlcance } from "@/lib/celebracion-detalle";
import { cargarTodas, contarPorDia, fechaResuelta } from "@/lib/celebraciones";
import { mesAnterior, mesSiguiente } from "@/lib/calendario";
import { MESES, hoyEn, mesDeSlug, slugDeMes } from "@/lib/fechas";
import { PAISES, rutaDePais, type CodigoPais } from "@/lib/paises";

function totales(mes: number, anio: number, pais: CodigoPais) {
  const conteos = contarPorDia(mes, anio, pais);
  let local = 0;
  let internacional = 0;
  for (const conteo of conteos.values()) {
    local += conteo.local;
    internacional += conteo.internacional;
  }
  return { local, internacional, conteos };
}

export function metadataDeCalendarioMes(pais: CodigoPais, slug: string): Metadata {
  const mes = mesDeSlug(slug);
  if (!mes) return { title: "Mes no encontrado" };

  const anio = hoyEn(pais).anio;
  const { local, internacional } = totales(mes, anio, pais);
  const nombreMes = MESES[mes - 1];
  const descripcion = `Todas las celebraciones de ${nombreMes}: ${local} en ${PAISES[pais].nombre}, ${internacional} internacionales.`;
  const url = rutaDePais(pais, `/calendario/${slug}`);

  return {
    title: `Calendario de ${nombreMes}`,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: PAISES[pais].locale,
      title: `Calendario de ${nombreMes} · ¿Qué se celebra hoy?`,
      description: descripcion,
      url,
    },
  };
}

export default function VistaCalendarioMes({ pais, slug }: { pais: CodigoPais; slug: string }) {
  const mes = mesDeSlug(slug);
  if (!mes) notFound();

  const anio = hoyEn(pais).anio;
  const { conteos } = totales(mes, anio, pais);
  const nombreMes = MESES[mes - 1];

  const celebracionesDelMes = cargarTodas()
    .map((c) => ({ c, resuelta: fechaResuelta(c, anio) }))
    .filter(({ resuelta }) => resuelta.mes === mes)
    .sort((a, b) => {
      if (a.resuelta.dia !== b.resuelta.dia) return a.resuelta.dia - b.resuelta.dia;
      return a.c.nombre.localeCompare(b.c.nombre, "es");
    });

  return (
    <>
      <div className="pt-7">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
          {String(anio)}
        </p>
        <h1 className="mt-1.5 text-[26px] leading-[1.12] font-semibold tracking-[-0.02em] capitalize sm:text-[32px]">
          {nombreMes}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={rutaDePais(pais, `/calendario/${slugDeMes(mesAnterior(mes))}`)}
            aria-label="Mes anterior"
            title="Mes anterior"
            className="grid size-9 place-items-center rounded-[10px] border border-borde bg-superficie text-texto-secundario transition-[color,transform] duration-150 hover:text-texto active:scale-[0.94]"
          >
            <IconoFlecha direccion="anterior" />
          </Link>
          <Link
            href={rutaDePais(pais, `/calendario/${slugDeMes(mesSiguiente(mes))}`)}
            aria-label="Mes siguiente"
            title="Mes siguiente"
            className="grid size-9 place-items-center rounded-[10px] border border-borde bg-superficie text-texto-secundario transition-[color,transform] duration-150 hover:text-texto active:scale-[0.94]"
          >
            <IconoFlecha direccion="siguiente" />
          </Link>
          <SelectorMes mes={mes} pais={pais} />
        </div>
      </div>
      <CalendarioMes mes={mes} anio={anio} conteosEntradas={Array.from(conteos.entries())} pais={pais} />
      <div className="mt-8">
        <h2 className="text-[13px] font-semibold tracking-[-0.01em]">
          Este mes ({celebracionesDelMes.length})
        </h2>
        <ul role="list" className="mt-2 border-t border-borde">
          {celebracionesDelMes.map(({ c, resuelta }) => (
            <li
              key={c.id}
              className="flex items-center gap-2.5 border-b border-borde px-0.5 py-2 transition-colors duration-150 active:bg-superficie-suave"
            >
              <span className="w-6 shrink-0 text-[13px] tabular-nums text-texto-secundario">
                {resuelta.dia}
              </span>
              <EmojiTile emoji={c.emoji} tono={tonoDeAlcance(c.alcance, pais)} tamanio="sm" />
              <Link
                href={rutaDePais(pais, `/celebracion/${c.id}`)}
                className="min-w-0 flex-1 truncate text-[14px] leading-5 font-medium underline-offset-2 hover:underline hover:decoration-acento active:opacity-70"
              >
                {c.nombre}
              </Link>
              <CategoriaChip categoria={c.categoria} />
              <Chip titulo={`Alcance: ${etiquetaDeAlcance(c).texto}`}>
                {c.alcance === "otro-pais" ? etiquetaDeAlcance(c).texto : etiquetaDeAlcance(c).bandera}
              </Chip>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
