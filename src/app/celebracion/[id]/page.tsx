import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoriaChip from "@/components/CategoriaChip";
import CelebracionItem from "@/components/CelebracionItem";
import Chip from "@/components/Chip";
import CompartirBoton from "@/components/CompartirBoton";
import EmojiTile, { tonoDeAlcance } from "@/components/EmojiTile";
import { cargarTodas, celebracionesDeFecha, celebracionPorId } from "@/lib/celebraciones";
import {
  banderaDePais,
  describirFechaMovilEsteAnio,
  dominioDeUrl,
  ETIQUETAS_TIPO_FUENTE,
} from "@/lib/celebracion-detalle";
import { formatearFechaCorta, hoyEnArgentina, resolverFechaMovil, slugDeFecha } from "@/lib/fechas";
import { esFechaMovil, type Celebracion } from "@/types/celebracion";

export const revalidate = 3600;

export function generateStaticParams() {
  return cargarTodas().map((c) => ({ id: c.id }));
}

export async function generateMetadata(props: PageProps<"/celebracion/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const celebracion = celebracionPorId(id);
  if (!celebracion) return { title: "Celebración no encontrada" };

  return {
    title: celebracion.nombre,
    description: celebracion.descripcion,
    alternates: { canonical: `/celebracion/${id}` },
    openGraph: {
      type: "article",
      locale: "es_AR",
      title: `${celebracion.nombre} · ¿Qué se celebra hoy?`,
      description: celebracion.descripcion,
      url: `/celebracion/${id}`,
    },
  };
}

function ChipAlcance({ celebracion }: { celebracion: Celebracion }) {
  if (celebracion.alcance === "argentina") return <Chip variante="accent">🇦🇷 Argentina</Chip>;
  if (celebracion.alcance === "internacional") return <Chip variante="accent">🌎 Internacional</Chip>;
  const pais = celebracion.pais ?? "";
  return (
    <Chip variante="accent">
      {banderaDePais(pais)} {pais}
    </Chip>
  );
}

function formatearVerificado(verificadoEn: string): string {
  const [anio, mes, dia] = verificadoEn.split("-");
  return `${dia}/${mes}/${anio}`;
}

export default async function PaginaCelebracion(props: PageProps<"/celebracion/[id]">) {
  const { id } = await props.params;
  const celebracion = celebracionPorId(id);
  if (!celebracion) notFound();

  const anioActual = hoyEnArgentina().anio;
  const fechaResuelta = esFechaMovil(celebracion.fecha)
    ? resolverFechaMovil(celebracion.fecha, anioActual)
    : celebracion.fecha;
  const slugFecha = slugDeFecha(fechaResuelta);
  const fechaCorta = formatearFechaCorta(fechaResuelta);

  const otrasCelebraciones = celebracionesDeFecha(fechaResuelta, anioActual).filter(
    (c) => c.id !== celebracion.id,
  );

  return (
    <div className="pt-7">
      <div>
        <Link
          href={`/fecha/${slugFecha}`}
          className="text-[13px] text-acento-texto underline-offset-2 hover:underline active:opacity-70"
        >
          ← {fechaCorta}
        </Link>
        {esFechaMovil(celebracion.fecha) ? (
          <p className="mt-1 text-[12px] leading-5 text-texto-secundario">
            {describirFechaMovilEsteAnio(celebracion.fecha, anioActual)}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-start gap-3">
        <EmojiTile emoji={celebracion.emoji} tono={tonoDeAlcance(celebracion.alcance)} />
        <h1 className="text-[26px] leading-[1.18] font-semibold tracking-[-0.02em] sm:text-[32px]">
          {celebracion.nombre}
        </h1>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ChipAlcance celebracion={celebracion} />
        <CategoriaChip categoria={celebracion.categoria} />
      </div>

      <p className="mt-4 text-[15px] leading-[1.6] text-texto">{celebracion.descripcion}</p>

      <div className="mt-4">
        <CompartirBoton titulo={`${celebracion.nombre} · ¿Qué se celebra hoy?`} />
      </div>

      <section className="mt-8">
        <h2 className="px-1 pb-2 text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
          Fuentes
        </h2>
        <ul className="overflow-hidden rounded-caja border border-borde bg-superficie">
          {celebracion.fuentes.map((fuente, i) => (
            <li
              key={`${fuente.url}-${i}`}
              className="border-b border-borde px-3.5 py-3 transition-colors duration-150 last:border-b-0 active:bg-superficie-suave"
            >
              <a
                href={fuente.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-[14px] leading-5 font-medium underline-offset-2 hover:underline">
                  {fuente.nombre}
                </span>
                <Chip>{ETIQUETAS_TIPO_FUENTE[fuente.tipo]}</Chip>
              </a>
              <p className="mt-1 text-[12px] leading-5 text-texto-secundario">{dominioDeUrl(fuente.url)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 px-1 text-[12px] leading-5 text-texto-secundario">
          Verificado el {formatearVerificado(celebracion.verificadoEn)}
        </p>
      </section>

      {celebracion.tags && celebracion.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {celebracion.tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      ) : null}

      {otrasCelebraciones.length > 0 ? (
        <section className="mt-8">
          <h2 className="px-1 pb-2 text-[11px] font-semibold tracking-[0.08em] text-texto-secundario uppercase">
            Otras celebraciones ese día
          </h2>
          <ul className="overflow-hidden rounded-caja border border-borde bg-superficie">
            {otrasCelebraciones.map((c, i) => (
              <CelebracionItem key={c.id} celebracion={c} indice={i} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
