import { describe, expect, it } from "vitest";
import { alcanceDeTexto, fusionarPais } from "@/lib/efemerides-importacion";
import type { Efemeride } from "@/types/efemeride";

describe("alcanceDeTexto", () => {
  it("detecta Colombia por gentilicio, país y ciudades", () => {
    expect(alcanceDeTexto("Gabriel García Márquez, escritor colombiano")).toBe("colombia");
    expect(alcanceDeTexto("En Bogotá se firma un tratado")).toBe("colombia");
    expect(alcanceDeTexto("Se funda Cartagena de Indias")).toBe("colombia");
    expect(alcanceDeTexto("En el Virreinato de Nueva Granada se subleva un pueblo")).toBe("colombia");
  });
  it("Argentina gana si el texto nombra a los dos", () => {
    expect(alcanceDeTexto("Futbolista argentino que jugó en Medellín")).toBe("argentina");
  });
  it("no confunde Caliço ni el Medellín español, pero conserva los colombianos", () => {
    expect(alcanceDeTexto("Muere Luís Caliço (54), regatista portugués.")).toBe("internacional");
    expect(
      alcanceDeTexto("En el marco de la guerra de independencia de España (1808-1814), Francia derrota a España en la batalla de Medellín."),
    ).toBe("internacional");
    expect(alcanceDeTexto("Se funda la ciudad de Cali.")).toBe("colombia");
    expect(alcanceDeTexto("Nace un escritor en Medellín, Colombia.")).toBe("colombia");
    expect(alcanceDeTexto("Se funda Medellín (Colombia).")).toBe("colombia");
  });
  it("no confunde palabras parecidas", () => {
    expect(alcanceDeTexto("Terremoto en California")).toBe("internacional");
    expect(alcanceDeTexto("Cristóbal Colón llega a las Antillas")).toBe("internacional");
    expect(alcanceDeTexto("Se funda Cartagena, en España")).toBe("internacional");
  });
});

function efemeride(id: string, anio: number, texto: string, alcance: Efemeride["alcance"], dia = 5): Efemeride {
  return {
    id,
    fecha: { dia, mes: 3 },
    anio,
    tipo: "acontecimiento",
    texto,
    alcance,
    fuentes: [{ nombre: "Wikipedia", url: "https://es.wikipedia.org/wiki/5_de_marzo", tipo: "secundaria" }],
    verificadoEn: "2026-09-16",
  };
}

describe("fusionarPais", () => {
  const existentes = [
    efemeride("1900-hecho-argentino", 1900, "Hecho argentino.", "argentina"),
    efemeride("1927-nace-garcia-marquez", 1927, "Nace Gabriel García Márquez, escritor colombiano.", "internacional"),
    efemeride("1950-hecho-mundial", 1950, "Hecho mundial.", "internacional"),
  ];
  const nuevas = [
    { ...efemeride("1927-nace-garcia-marquez-2", 1927, "Nace Gabriel García Márquez, escritor colombiano.", "colombia"), verificadoEn: "2026-09-30" },
    { ...efemeride("1810-grito-ficticio", 1810, "Hecho ocurrido en Bogotá.", "colombia"), verificadoEn: "2026-09-30" },
  ];
  const resultado = fusionarPais(existentes, nuevas, "colombia");

  it("no toca las entradas que no son del país", () => {
    expect(resultado.find((e) => e.id === "1900-hecho-argentino")).toEqual(existentes[0]);
    expect(resultado.find((e) => e.id === "1950-hecho-mundial")).toEqual(existentes[2]);
  });
  it("reclasifica la coincidencia conservando id y fecha de verificación, y la marca tambienInternacional", () => {
    const gabo = resultado.find((e) => e.id === "1927-nace-garcia-marquez");
    expect(gabo).toMatchObject({ alcance: "colombia", tambienInternacional: true, verificadoEn: "2026-09-16" });
    expect(resultado.some((e) => e.id === "1927-nace-garcia-marquez-2")).toBe(false);
  });
  it("agrega las nuevas sin marca y deja todo ordenado por día y año", () => {
    const nueva = resultado.find((e) => e.id === "1810-grito-ficticio");
    expect(nueva?.alcance).toBe("colombia");
    expect(nueva?.tambienInternacional).toBeUndefined();
    expect(resultado.map((e) => e.anio)).toEqual([1810, 1900, 1927, 1950]);
  });
  it("es idempotente", () => {
    expect(fusionarPais(resultado, nuevas, "colombia")).toEqual(resultado);
  });
  it("descarta duplicados dentro de las nuevas", () => {
    const repetida = efemeride("1810-grito-ficticio-2", 1810, "Hecho ocurrido en Bogotá.", "colombia");
    const conRepetida = fusionarPais(existentes, [...nuevas, repetida], "colombia");
    expect(conRepetida.filter((e) => e.texto === "Hecho ocurrido en Bogotá.")).toHaveLength(1);
  });
});
