import type { MetadataRoute } from "next";
import { cargarTodas } from "@/lib/celebraciones";
import { diasDelMes, slugDeFecha, slugDeMes } from "@/lib/fechas";

const ANIO_BISIESTO_REFERENCIA = 2024;
const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const entradas: MetadataRoute.Sitemap = [
    { url: sitio, changeFrequency: "daily", priority: 1 },
    { url: `${sitio}/buscar`, changeFrequency: "monthly", priority: 0.5 },
  ];

  for (let mes = 1; mes <= 12; mes++) {
    entradas.push({
      url: `${sitio}/calendario/${slugDeMes(mes)}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
    for (let dia = 1; dia <= diasDelMes(mes, ANIO_BISIESTO_REFERENCIA); dia++) {
      entradas.push({
        url: `${sitio}/fecha/${slugDeFecha({ dia, mes })}`,
        changeFrequency: "yearly",
        priority: 0.7,
      });
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
