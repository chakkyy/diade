import { describe, expect, it } from "vitest";
import { idsExistentes, insertarOrdenado, nombreArchivoMes, slugDeNombre } from "@/lib/datos-edicion";
import type { Celebracion } from "@/types/celebracion";

function fija(id: string, dia: number, mes = 9): Celebracion {
  return {
    id,
    nombre: id,
    fecha: { dia, mes },
    alcance: "argentina",
    categoria: "sociedad",
    descripcion: "Descripción de prueba.",
    fuentes: [{ nombre: "Fuente", url: "https://example.com/", tipo: "institucional" }],
    verificadoEn: "2026-09-11",
  };
}

function movil(id: string, ordinal: 1 | 2 | 3 | 4 | -1, diaSemana: number, mes = 10): Celebracion {
  return {
    id,
    nombre: id,
    fecha: { mes, ordinal, diaSemana: diaSemana as 0 | 1 | 2 | 3 | 4 | 5 | 6 },
    alcance: "argentina",
    categoria: "familia",
    descripcion: "Descripción de prueba.",
    fuentes: [{ nombre: "Fuente", url: "https://example.com/", tipo: "institucional" }],
    verificadoEn: "2026-09-11",
  };
}

describe("slugDeNombre", () => {
  it("convierte a kebab-case sin tildes", () => {
    expect(slugDeNombre("Día del Fotógrafo")).toBe("dia-del-fotografo");
  });
  it("colapsa espacios múltiples y signos", () => {
    expect(slugDeNombre("  Día  del  Niño/a  ")).toBe("dia-del-nino-a");
  });
  it("maneja ñ", () => {
    expect(slugDeNombre("Día del Ingeniero/a")).toBe("dia-del-ingeniero-a");
  });
});

describe("nombreArchivoMes", () => {
  it("rellena con cero a la izquierda", () => {
    expect(nombreArchivoMes(9)).toBe("09.json");
  });
  it("no rellena cuando ya tiene dos dígitos", () => {
    expect(nombreArchivoMes(12)).toBe("12.json");
  });
});

describe("insertarOrdenado", () => {
  it("inserta una fecha fija en orden ascendente de día", () => {
    const lista = [fija("a", 5), fija("c", 20)];
    const resultado = insertarOrdenado(lista, fija("b", 11));
    expect(resultado.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });
  it("inserta una fecha fija al principio si el día es menor a todos", () => {
    const lista = [fija("b", 11), fija("c", 20)];
    const resultado = insertarOrdenado(lista, fija("a", 5));
    expect(resultado.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });
  it("las móviles van siempre después de las fijas", () => {
    const lista = [fija("a", 5), movil("z", 3, 0)];
    const resultado = insertarOrdenado(lista, fija("b", 20));
    expect(resultado.map((c) => c.id)).toEqual(["a", "b", "z"]);
  });
  it("una nueva móvil se agrega al final", () => {
    const lista = [fija("a", 5), movil("z", 3, 0)];
    const resultado = insertarOrdenado(lista, movil("y", 1, 0));
    expect(resultado.map((c) => c.id)).toEqual(["a", "z", "y"]);
  });
  it("no muta la lista original", () => {
    const lista = [fija("a", 5)];
    insertarOrdenado(lista, fija("b", 1));
    expect(lista.map((c) => c.id)).toEqual(["a"]);
  });
});

describe("idsExistentes", () => {
  it("junta los ids de todos los archivos, no sólo el primero", () => {
    const archivos = [[fija("a", 5)], [fija("b", 11)], [movil("z", 3, 0)]];
    const ids = idsExistentes(archivos);
    expect(ids.has("a")).toBe(true);
    expect(ids.has("b")).toBe(true);
    expect(ids.has("z")).toBe(true);
  });
  it("detecta un id duplicado en un archivo distinto al que se está editando", () => {
    const archivoSeptiembre = [fija("dia-del-maestro", 11, 9)];
    const archivoEnero = [fija("otra-celebracion", 3, 1)];
    const ids = idsExistentes([archivoSeptiembre, archivoEnero]);
    expect(ids.has("dia-del-maestro")).toBe(true);
  });
  it("devuelve un set vacío sin archivos", () => {
    expect(idsExistentes([]).size).toBe(0);
  });
});
