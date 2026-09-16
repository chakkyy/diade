import path from "node:path";
import { describe, expect, it } from "vitest";
import { agruparEfemerides, cargarEfemerides, efemeridesDeFecha } from "@/lib/efemerides";
import { efemerideSchema } from "@/lib/schema";

const FIXTURES = path.join(process.cwd(), "tests", "fixtures", "efemerides");

const base = {
  id: "1945-nace-tanguito",
  fecha: { dia: 16, mes: 9 },
  anio: 1945,
  tipo: "nacimiento",
  texto: "Nace Tanguito, músico y compositor argentino (f. 1972).",
  alcance: "argentina",
  fuentes: [{ nombre: "Wikipedia (Tanguito)", url: "https://es.wikipedia.org/wiki/Tanguito", tipo: "secundaria" }],
  verificadoEn: "2026-09-16",
};

describe("efemerideSchema", () => {
  it("acepta una efeméride válida con Wikipedia como única fuente", () => {
    expect(efemerideSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza una efeméride sin fuentes", () => {
    expect(efemerideSchema.safeParse({ ...base, fuentes: [] }).success).toBe(false);
  });

  it("rechaza un texto que no termina en punto", () => {
    expect(efemerideSchema.safeParse({ ...base, texto: "Nace Tanguito" }).success).toBe(false);
  });

  it("rechaza una fecha móvil", () => {
    expect(efemerideSchema.safeParse({ ...base, fecha: { mes: 9, ordinal: 3, diaSemana: 0 } }).success).toBe(false);
  });

  it("rechaza un día fuera de rango para el mes", () => {
    expect(efemerideSchema.safeParse({ ...base, fecha: { dia: 31, mes: 9 } }).success).toBe(false);
  });
});

describe("cargarEfemerides y efemeridesDeFecha", () => {
  const todas = cargarEfemerides(FIXTURES);

  it("carga todas las efemérides del directorio", () => {
    expect(todas).toHaveLength(4);
  });

  it("devuelve solo las del día, Argentina primero y después por año ascendente", () => {
    const lista = efemeridesDeFecha({ dia: 16, mes: 9 }, todas);
    expect(lista.map((e) => e.anio)).toEqual([1945, 1976, 1810]);
    expect(lista.map((e) => e.alcance)).toEqual(["argentina", "argentina", "internacional"]);
  });

  it("agrupa por alcance conservando el orden", () => {
    const { argentina, internacional } = agruparEfemerides(efemeridesDeFecha({ dia: 16, mes: 9 }, todas));
    expect(argentina.map((e) => e.anio)).toEqual([1945, 1976]);
    expect(internacional.map((e) => e.anio)).toEqual([1810]);
  });

  it("incluye a Tanguito el 16 de septiembre", () => {
    const lista = efemeridesDeFecha({ dia: 16, mes: 9 }, todas);
    expect(lista.some((e) => /Tanguito/.test(e.texto))).toBe(true);
  });

  it("devuelve vacío para un día sin efemérides", () => {
    expect(efemeridesDeFecha({ dia: 1, mes: 1 }, todas)).toEqual([]);
  });
});
