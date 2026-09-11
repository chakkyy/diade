import { describe, expect, it } from "vitest";
import { cargarTodas, celebracionesDeFecha } from "@/lib/celebraciones";

const todas = cargarTodas();

function nombresDe(dia: number, mes: number) {
  return celebracionesDeFecha({ dia, mes }, 2026, todas).map((c) => c.nombre);
}

describe("datos reales", () => {
  it("cargan y validan todos los archivos de data/celebraciones", () => {
    expect(todas.length).toBeGreaterThan(0);
  });

  it("no repite ids", () => {
    const ids = todas.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda celebración tiene al menos una fuente no secundaria", () => {
    const sinFuente = todas.filter((c) => !c.fuentes.some((f) => f.tipo !== "secundaria"));
    expect(sinFuente.map((c) => c.id)).toEqual([]);
  });

  it("10 de septiembre incluye el Día del Terapista Ocupacional (Argentina)", () => {
    const c = celebracionesDeFecha({ dia: 10, mes: 9 }, 2026, todas).find((x) =>
      /terapista ocupacional/i.test(x.nombre),
    );
    expect(c).toBeDefined();
    expect(c?.alcance).toBe("argentina");
    expect(c?.categoria).toBe("profesion");
  });

  it("11 de septiembre incluye el Día del Maestro y el Día Panamericano del Maestro", () => {
    const nombres = nombresDe(11, 9);
    expect(nombres).toContain("Día del Maestro");
    expect(nombres.some((n) => /panamericano del maestro/i.test(n))).toBe(true);
  });

  it("21 de septiembre incluye Fotógrafo, Primavera y Estudiante", () => {
    const nombres = nombresDe(21, 9).join(" | ");
    expect(nombres).toMatch(/Fotógrafo/);
    expect(nombres).toMatch(/Primavera/);
    expect(nombres).toMatch(/Estudiante/);
  });

  it("Argentina va antes que internacional el 11 de septiembre", () => {
    const lista = celebracionesDeFecha({ dia: 11, mes: 9 }, 2026, todas);
    const primerInternacional = lista.findIndex((c) => c.alcance === "internacional");
    const ultimaArgentina = lista.map((c) => c.alcance).lastIndexOf("argentina");
    expect(ultimaArgentina).toBeLessThan(primerInternacional);
  });
});
