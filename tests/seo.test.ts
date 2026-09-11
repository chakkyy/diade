import { describe, expect, it } from "vitest";
import type { Celebracion } from "@/types/celebracion";
import {
  descripcionDeFecha,
  descripcionDeHoy,
  nombresPrincipales,
  ordenarPorRelevancia,
  tituloDeFecha,
} from "@/lib/seo";

const base: Omit<Celebracion, "id" | "nombre" | "alcance"> = {
  fecha: { dia: 11, mes: 9 },
  categoria: "educacion",
  descripcion: "Una descripcion de prueba.",
  fuentes: [{ nombre: "Fuente", url: "https://example.org", tipo: "institucional" }],
  verificadoEn: "2026-09-11",
};

function celebracion(
  nombre: string,
  alcance: Celebracion["alcance"] = "argentina",
  extra: Partial<Celebracion> = {},
): Celebracion {
  return { ...base, id: nombre.toLowerCase().replace(/\s+/g, "-"), nombre, alcance, ...extra };
}

const FECHA = { dia: 11, mes: 9 };

describe("ordenarPorRelevancia", () => {
  it("pone argentina antes que internacional y otro-pais", () => {
    const lista = [
      celebracion("Internacional", "internacional"),
      celebracion("Chilena", "otro-pais", { pais: "Chile" }),
      celebracion("Argentina"),
    ];
    expect(ordenarPorRelevancia(lista).map((c) => c.nombre)).toEqual([
      "Argentina",
      "Internacional",
      "Chilena",
    ]);
  });

  it("pone los destacados al tope de su alcance", () => {
    const lista = [
      celebracion("Comun"),
      celebracion("Destacada", "argentina", { destacado: true }),
    ];
    expect(ordenarPorRelevancia(lista).map((c) => c.nombre)).toEqual(["Destacada", "Comun"]);
  });

  it("no muta la lista original", () => {
    const lista = [celebracion("Internacional", "internacional"), celebracion("Argentina")];
    ordenarPorRelevancia(lista);
    expect(lista.map((c) => c.nombre)).toEqual(["Internacional", "Argentina"]);
  });
});

describe("nombresPrincipales", () => {
  it("devuelve como maximo el limite pedido", () => {
    const lista = ["A", "B", "C", "D"].map((n) => celebracion(n));
    expect(nombresPrincipales(lista, 3)).toEqual(["A", "B", "C"]);
  });

  it("con lista vacia devuelve vacio", () => {
    expect(nombresPrincipales([], 3)).toEqual([]);
  });
});

describe("tituloDeFecha", () => {
  it("sin celebraciones devuelve solo la fecha", () => {
    expect(tituloDeFecha([], FECHA)).toBe("11 de septiembre");
  });

  it("con una celebracion la nombra", () => {
    expect(tituloDeFecha([celebracion("Día del Maestro")], FECHA)).toBe(
      "11 de septiembre: Día del Maestro",
    );
  });

  it("con dos celebraciones nombra las dos sin contador", () => {
    const lista = [celebracion("Día del Maestro"), celebracion("Día del Cliente")];
    expect(tituloDeFecha(lista, FECHA)).toBe("11 de septiembre: Día del Maestro, Día del Cliente");
  });

  it("con cinco celebraciones nombra dos y cuenta el resto", () => {
    const lista = [
      celebracion("Día del Maestro"),
      celebracion("Día del Cliente"),
      celebracion("Día Panamericano del Maestro", "internacional"),
      celebracion("Día de la Radio", "internacional"),
      celebracion("Día del Profesor", "otro-pais", { pais: "Chile" }),
    ];
    expect(tituloDeFecha(lista, FECHA)).toBe(
      "11 de septiembre: Día del Maestro, Día del Cliente y 3 más",
    );
  });

  it("prioriza las argentinas aunque vengan ultimas", () => {
    const lista = [
      celebracion("Día Panamericano del Maestro", "internacional"),
      celebracion("Día del Maestro"),
    ];
    expect(tituloDeFecha(lista, FECHA)).toBe(
      "11 de septiembre: Día del Maestro, Día Panamericano del Maestro",
    );
  });
});

describe("descripcionDeFecha", () => {
  it("sin celebraciones es honesta", () => {
    expect(descripcionDeFecha([], FECHA)).toBe(
      "Todavía no tenemos celebraciones registradas para el 11 de septiembre.",
    );
  });

  it("con una celebracion usa singular", () => {
    expect(descripcionDeFecha([celebracion("Día del Maestro")], FECHA)).toBe(
      "El 11 de septiembre se celebra: Día del Maestro. Con fuente verificable.",
    );
  });

  it("con dos celebraciones usa plural", () => {
    const lista = [celebracion("Día del Maestro"), celebracion("Día del Cliente")];
    expect(descripcionDeFecha(lista, FECHA)).toBe(
      "El 11 de septiembre se celebran: Día del Maestro, Día del Cliente. Con fuentes verificables.",
    );
  });

  it("con cinco celebraciones lista tres y cuenta el resto", () => {
    const lista = ["A", "B", "C", "D", "E"].map((n) => celebracion(n));
    expect(descripcionDeFecha(lista, FECHA)).toBe(
      "El 11 de septiembre se celebran: A, B, C y 2 más. Con fuentes verificables.",
    );
  });
});

describe("descripcionDeHoy", () => {
  it("sin celebraciones es honesta", () => {
    expect(descripcionDeHoy([], "viernes 11 de septiembre")).toBe(
      "Hoy es viernes 11 de septiembre y todavía no tenemos celebraciones registradas.",
    );
  });

  it("con celebraciones lista hasta tres", () => {
    const lista = ["A", "B", "C", "D"].map((n) => celebracion(n));
    expect(descripcionDeHoy(lista, "viernes 11 de septiembre")).toBe(
      "Hoy, viernes 11 de septiembre, se celebran: A, B, C y 1 más. Con fuentes verificables.",
    );
  });

  it("con una sola celebracion usa singular", () => {
    expect(descripcionDeHoy([celebracion("Día del Maestro")], "viernes 11 de septiembre")).toBe(
      "Hoy, viernes 11 de septiembre, se celebra: Día del Maestro. Con fuente verificable.",
    );
  });
});
