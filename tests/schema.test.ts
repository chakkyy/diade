import { describe, expect, it } from "vitest";
import { celebracionSchema } from "@/lib/schema";

const base = {
  id: "dia-del-maestro",
  nombre: "Día del Maestro",
  fecha: { dia: 11, mes: 9 },
  alcance: "argentina",
  categoria: "educacion",
  descripcion: "Homenaje a Domingo Faustino Sarmiento en el aniversario de su muerte.",
  fuentes: [{ nombre: "Argentina.gob.ar", url: "https://www.argentina.gob.ar/", tipo: "institucional" }],
  verificadoEn: "2026-09-11",
};

describe("celebracionSchema", () => {
  it("acepta una celebración válida", () => {
    expect(celebracionSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza una entrada cuya única fuente es secundaria", () => {
    const r = celebracionSchema.safeParse({
      ...base,
      fuentes: [{ nombre: "Wikipedia", url: "https://es.wikipedia.org/", tipo: "secundaria" }],
    });
    expect(r.success).toBe(false);
  });
  it("exige pais cuando el alcance es otro-pais", () => {
    expect(celebracionSchema.safeParse({ ...base, alcance: "otro-pais" }).success).toBe(false);
    expect(celebracionSchema.safeParse({ ...base, alcance: "otro-pais", pais: "Chile" }).success).toBe(true);
  });
  it("rechaza 31 de septiembre", () => {
    expect(celebracionSchema.safeParse({ ...base, fecha: { dia: 31, mes: 9 } }).success).toBe(false);
  });
  it("acepta fechas móviles", () => {
    expect(celebracionSchema.safeParse({ ...base, fecha: { mes: 10, ordinal: 3, diaSemana: 0 } }).success).toBe(true);
  });
  it("rechaza ids con tildes o mayúsculas", () => {
    expect(celebracionSchema.safeParse({ ...base, id: "Día-del-Maestro" }).success).toBe(false);
  });
  it("rechaza una fecha móvil disfrazada de fija con campos de ambas", () => {
    const r = celebracionSchema.safeParse({
      ...base,
      fecha: { mes: 10, dia: 18, ordinal: 3, diaSemana: 0 },
    });
    expect(r.success).toBe(false);
  });
  it("rechaza una fecha fija con campos móviles extra", () => {
    const r = celebracionSchema.safeParse({
      ...base,
      fecha: { dia: 11, mes: 9, ordinal: 3, diaSemana: 0 },
    });
    expect(r.success).toBe(false);
  });
  it("rechaza verificadoEn con una fecha inexistente", () => {
    const r = celebracionSchema.safeParse({ ...base, verificadoEn: "2026-99-99" });
    expect(r.success).toBe(false);
  });
});
