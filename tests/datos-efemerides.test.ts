import { describe, expect, it } from "vitest";
import { cargarEfemerides, efemeridesDeFecha } from "@/lib/efemerides";
import { diasDelMes } from "@/lib/fechas";

const todas = cargarEfemerides();

describe("datos reales de efemérides", () => {
  it("cargan y validan todos los archivos de data/efemerides", () => {
    expect(todas.length).toBeGreaterThan(0);
  });

  it("no repite ids", () => {
    const ids = todas.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todos los días del año tienen al menos una efeméride", () => {
    const vacios: string[] = [];
    for (let mes = 1; mes <= 12; mes++) {
      for (let dia = 1; dia <= diasDelMes(mes, 2024); dia++) {
        if (efemeridesDeFecha({ dia, mes }, todas).length === 0) vacios.push(`${dia}/${mes}`);
      }
    }
    expect(vacios).toEqual([]);
  });

  it("todos los días tienen al menos una efeméride argentina", () => {
    const vacios: string[] = [];
    for (let mes = 1; mes <= 12; mes++) {
      for (let dia = 1; dia <= diasDelMes(mes, 2024); dia++) {
        if (!efemeridesDeFecha({ dia, mes }, todas).some((e) => e.alcance === "argentina")) vacios.push(`${dia}/${mes}`);
      }
    }
    expect(vacios).toEqual([]);
  });

  it("Argentina va antes que internacional el 16 de septiembre", () => {
    const lista = efemeridesDeFecha({ dia: 16, mes: 9 }, todas);
    const primerInternacional = lista.findIndex((e) => e.alcance === "internacional");
    const ultimaArgentina = lista.map((e) => e.alcance).lastIndexOf("argentina");
    expect(ultimaArgentina).toBeLessThan(primerInternacional);
  });

  it("16 de septiembre incluye el nacimiento de Tanguito en 1945", () => {
    const e = efemeridesDeFecha({ dia: 16, mes: 9 }, todas).find((x) => /Tanguito/.test(x.texto));
    expect(e).toBeDefined();
    expect(e?.anio).toBe(1945);
    expect(e?.tipo).toBe("nacimiento");
    expect(e?.alcance).toBe("argentina");
  });
});
