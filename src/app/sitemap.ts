import type { MetadataRoute } from "next";
import { cargarTodas } from "@/lib/celebraciones";
import { diasDelMes, slugDeFecha, slugDeMes } from "@/lib/fechas";
import { CODIGOS_PAIS, rutaDePais } from "@/lib/paises";

const ANIO_BISIESTO_REFERENCIA = 2024;
const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const entradas: MetadataRoute.Sitemap = [];

  for (const pais of CODIGOS_PAIS) {
    const inicio = rutaDePais(pais, "/");
    entradas.push(
      { url: inicio === "/" ? sitio : `${sitio}${inicio}`, changeFrequency: "daily", priority: 1 },
      { url: `${sitio}${rutaDePais(pais, "/buscar")}`, changeFrequency: "monthly", priority: 0.5 },
    );

    for (let mes = 1; mes <= 12; mes++) {
      entradas.push({
        url: `${sitio}${rutaDePais(pais, `/calendario/${slugDeMes(mes)}`)}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
      for (let dia = 1; dia <= diasDelMes(mes, ANIO_BISIESTO_REFERENCIA); dia++) {
        entradas.push({
          url: `${sitio}${rutaDePais(pais, `/fecha/${slugDeFecha({ dia, mes })}`)}`,
          changeFrequency: "yearly",
          priority: 0.7,
        });
      }
    }
  }

  for (const celebracion of cargarTodas()) {
    entradas.push({
      url: `${sitio}/celebracion/${celebracion.id}`,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  return entradas;
}
