import { z } from "zod";
import { ALCANCES, CATEGORIAS, TIPOS_FUENTE } from "@/types/celebracion";

const fuenteSchema = z.object({
  nombre: z.string().min(2),
  url: z.url(),
  tipo: z.enum(TIPOS_FUENTE),
});

const fechaFijaSchema = z
  .object({
    dia: z.number().int().min(1).max(31),
    mes: z.number().int().min(1).max(12),
  })
  .strict();

const fechaMovilSchema = z
  .object({
    mes: z.number().int().min(1).max(12),
    ordinal: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(-1)]),
    diaSemana: z.number().int().min(0).max(6),
  })
  .strict();

const DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const celebracionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id debe ser kebab-case sin tildes"),
    nombre: z.string().min(3).max(140),
    fecha: z.union([fechaFijaSchema, fechaMovilSchema]),
    alcance: z.enum(ALCANCES),
    pais: z.string().min(2).optional(),
    categoria: z.enum(CATEGORIAS),
    descripcion: z.string().min(10).max(220).regex(/[.!?]$/, "descripcion termina en punto"),
    fuentes: z.array(fuenteSchema).min(1),
    emoji: z.string().min(1).max(8).optional(),
    tags: z.array(z.string().min(2)).optional(),
    destacado: z.boolean().optional(),
    verificadoEn: z.iso.date("verificadoEn debe ser una fecha YYYY-MM-DD válida"),
  })
  .strict()
  .refine((c) => c.fuentes.some((f) => f.tipo !== "secundaria"), {
    message: "al menos una fuente debe ser institucional, asociacion o normativa",
    path: ["fuentes"],
  })
  .refine((c) => c.alcance !== "otro-pais" || Boolean(c.pais), {
    message: "alcance otro-pais requiere pais",
    path: ["pais"],
  })
  .refine((c) => "ordinal" in c.fecha || c.fecha.dia <= DIAS_POR_MES[c.fecha.mes - 1], {
    message: "dia fuera de rango para el mes",
    path: ["fecha", "dia"],
  });

export const archivoMesSchema = z.array(celebracionSchema);

export type CelebracionValidada = z.infer<typeof celebracionSchema>;
