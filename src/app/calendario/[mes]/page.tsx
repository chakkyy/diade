import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CalendarioMes from "@/components/CalendarioMes";
import CategoriaChip from "@/components/CategoriaChip";
import Chip from "@/components/Chip";
import EmojiTile, { tonoDeAlcance } from "@/components/EmojiTile";
import SelectorMes from "@/components/SelectorMes";
import { IconoFlecha } from "@/components/iconos";
import { cargarTodas, contarPorDia, fechaResuelta } from "@/lib/celebraciones";
import { mesAnterior, mesSiguiente } from "@/lib/calendario";
import { MESES, hoyEnArgentina, mesDeSlug, slugDeMes } from "@/lib/fechas";

export const revalidate = 3600;

export function generateStaticParams() {
  return MESES.map((mes) => ({ mes }));
}

function totales(mes: number, anio: number) {
  const conteos = contarPorDia(mes, anio);
  let argentina = 0;
  let internacional = 0;
  for (const conteo of conteos.values()) {
    argentina += conteo.argentina;
    internacional += conteo.internacional;
  }
  return { argentina, internacional, conteos };
}

export async function generateMetadata(props: PageProps<"/calendario/[mes]">): Promise<Metadata> {
  const { mes: slug } = await props.params;
  const mes = mesDeSlug(slug);
  if (!mes) return { title: "Mes no encontrado" };

  const anio = hoyEnArgentina().anio;
  const { argentina, internacional } = totales(mes, anio);
  const nombreMes = MESES[mes - 1];

  return {
    title: `Calendario de ${nombreMes}`,
    description: `Todas las celebraciones de ${nombreMes}: ${argentina} en Argentina, ${internacional} internacionales.`,
    alternates: { canonical: `/calendario/${slug}` },
    openGraph: {
      type: "website",
      locale: "es_AR",
      title: `Calendario de ${nombreMes} · ¿Qué se celebra hoy?`,
      description: `Todas las celebraciones de ${nombreMes}: ${argentina} en Argentina, ${internacional} internacionales.`,
      url: `/calendario/${slug}`,
    },
  };
}

export default async function PaginaCalendarioMes(props: PageProps<"/calendario/[mes]">) {
  const { mes: slug } = await props.params;
  const mes = mesDeSlug(slug);
  if (!mes) notFound();

  const hoy = hoyEnArgentina();
  const anio = hoy.anio;
  const { conteos } = totales(mes, anio);
  const nombreMes = MESES[mes - 1];
  const esMesActual = mes === hoy.mes;

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
            href={`/calendario/${slugDeMes(mesAnterior(mes))}`}
            aria-label="Mes anterior"
            title="Mes anterior"
            className="grid size-9 place-items-center rounded-[10px] border border-borde bg-superficie text-texto-secundario transition-[color,transform] duration-150 hover:text-texto active:scale-[0.94]"
          >
            <IconoFlecha direccion="anterior" />
          </Link>
          <Link
            href={`/calendario/${slugDeMes(mesSiguiente(mes))}`}
            aria-label="Mes siguiente"
            title="Mes siguiente"
            className="grid size-9 place-items-center rounded-[10px] border border-borde bg-superficie text-texto-secundario transition-[color,transform] duration-150 hover:text-texto active:scale-[0.94]"
          >
            <IconoFlecha direccion="siguiente" />
          </Link>
          <SelectorMes mes={mes} />
        </div>
      </div>
      <CalendarioMes
        mes={mes}
        anio={anio}
        conteos={conteos}
        hoy={esMesActual ? { dia: hoy.dia, mes: hoy.mes } : null}
      />
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
              <EmojiTile emoji={c.emoji} tono={tonoDeAlcance(c.alcance)} tamanio="sm" />
              <Link
                href={`/celebracion/${c.id}`}
                className="min-w-0 flex-1 truncate text-[14px] leading-5 font-medium underline-offset-2 hover:underline hover:decoration-acento active:opacity-70"
              >
                {c.nombre}
              </Link>
              <CategoriaChip categoria={c.categoria} />
              {c.alcance === "argentina" ? (
                <Chip titulo="Alcance: Argentina">🇦🇷</Chip>
              ) : c.alcance === "internacional" ? (
                <Chip titulo="Alcance: Internacional">🌎</Chip>
              ) : (
                <Chip titulo={`Alcance: ${c.pais ?? "otro país"}`}>{c.pais ?? "otro país"}</Chip>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
