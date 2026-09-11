import { describe, expect, it } from "vitest";
import { leerFiltros, escribirFiltros } from "@/lib/buscar-url";

describe("leerFiltros", () => {
  it("lee q, alcance y categoria simples", () => {
    expect(leerFiltros({ q: "perro", alcance: "argentina", categoria: "animales" })).toEqual({
      q: "perro",
      alcance: ["argentina"],
      categoria: ["animales"],
    });
  });
  it("lee alcance y categoria repetibles", () => {
    expect(
      leerFiltros({ alcance: ["argentina", "internacional"], categoria: ["animales", "salud"] }),
    ).toEqual({
      q: "",
      alcance: ["argentina", "internacional"],
      categoria: ["animales", "salud"],
    });
  });
  it("ignora valores inválidos de alcance y categoria", () => {
    expect(
      leerFiltros({ alcance: ["marte", "argentina"], categoria: ["inventada", "salud"] }),
    ).toEqual({
      q: "",
      alcance: ["argentina"],
      categoria: ["salud"],
    });
  });
  it("sin parámetros devuelve valores vacíos", () => {
    expect(leerFiltros({})).toEqual({ q: "", alcance: [], categoria: [] });
  });
  it("q repetida toma el primer valor", () => {
    expect(leerFiltros({ q: ["uno", "dos"] })).toEqual({ q: "uno", alcance: [], categoria: [] });
  });
  it("q undefined da string vacío", () => {
    expect(leerFiltros({ q: undefined })).toEqual({ q: "", alcance: [], categoria: [] });
  });
});

describe("escribirFiltros", () => {
  it("omite todo cuando está vacío", () => {
    expect(escribirFiltros({ q: "", alcance: [], categoria: [] })).toBe("");
  });
  it("incluye q sola", () => {
    expect(escribirFiltros({ q: "perro", alcance: [], categoria: [] })).toBe("q=perro");
  });
  it("incluye alcance y categoria repetidos", () => {
    expect(
      escribirFiltros({ q: "", alcance: ["argentina"], categoria: ["animales", "salud"] }),
    ).toBe("alcance=argentina&categoria=animales&categoria=salud");
  });
  it("mantiene el orden estable q, alcance, categoria", () => {
    expect(
      escribirFiltros({ q: "perro", alcance: ["argentina", "otro-pais"], categoria: ["animales"] }),
    ).toBe("q=perro&alcance=argentina&alcance=otro-pais&categoria=animales");
  });
});
