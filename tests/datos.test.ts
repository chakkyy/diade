import { describe, expect, it } from "vitest";
import { cargarTodas, celebracionesDeFecha, fechaResuelta } from "@/lib/celebraciones";

const todas = cargarTodas();

function nombresDe(dia: number, mes: number) {
  return celebracionesDeFecha({ dia, mes }, 2026, "ar", todas).map((c) => c.nombre);
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
    const c = celebracionesDeFecha({ dia: 10, mes: 9 }, 2026, "ar", todas).find((x) =>
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
    const lista = celebracionesDeFecha({ dia: 11, mes: 9 }, 2026, "ar", todas);
    const primerInternacional = lista.findIndex((c) => c.alcance === "internacional");
    const ultimaArgentina = lista.map((c) => c.alcance).lastIndexOf("argentina");
    expect(ultimaArgentina).toBeLessThan(primerInternacional);
  });
});

describe("datos de Colombia", () => {
  const colombianas = todas.filter((c) => c.alcance === "colombia");

  it("hay al menos 75 celebraciones colombianas", () => {
    expect(colombianas.length).toBeGreaterThanOrEqual(75);
  });
  it("hay celebraciones colombianas en los doce meses", () => {
    const meses = new Set(colombianas.map((c) => fechaResuelta(c, 2026).mes));
    expect(meses.size).toBe(12);
  });
  it("ninguna lleva pais y ninguna entrada otro-pais es de Colombia o Argentina", () => {
    expect(colombianas.filter((c) => c.pais !== undefined).map((c) => c.id)).toEqual([]);
    expect(todas.filter((c) => c.pais === "Colombia" || c.pais === "Argentina").map((c) => c.id)).toEqual([]);
  });
  it("Colombia va primero en /co el día de la Independencia", () => {
    const lista = celebracionesDeFecha({ dia: 20, mes: 7 }, 2026, "co", todas);
    expect(lista[0]?.alcance).toBe("colombia");
  });
});
