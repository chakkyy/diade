import { describe, expect, it } from "vitest";
import { nombreCortoFuente } from "@/lib/fuentes";

describe("nombreCortoFuente", () => {
  it("corta en el primer guion con espacios", () => {
    expect(nombreCortoFuente("Argentina.gob.ar - ¿Por qué se celebra el Día del Maestro?")).toBe(
      "Argentina.gob.ar",
    );
  });

  it("corta también con guion medio", () => {
    expect(nombreCortoFuente("Naciones Unidas – Días Internacionales")).toBe("Naciones Unidas");
  });

  it("corta en los dos puntos", () => {
    expect(nombreCortoFuente("UNESCO: Día Mundial de la Radio")).toBe("UNESCO");
  });

  it("deja igual un nombre que ya es corto", () => {
    expect(nombreCortoFuente("Ministerio de Cultura de la Nación")).toBe(
      "Ministerio de Cultura de la Nación",
    );
  });

  it("no corta guiones sin espacios alrededor", () => {
    expect(nombreCortoFuente("Cámara Franco-Argentina")).toBe("Cámara Franco-Argentina");
  });

  it("recorta a 40 caracteres con puntos suspensivos", () => {
    const largo = nombreCortoFuente("Biblioteca del Congreso Nacional de Chile");
    expect(largo).toBe("Biblioteca del Congreso Nacional de Chi…");
    expect(largo.length).toBe(40);
  });

  it("saca espacios sobrantes", () => {
    expect(nombreCortoFuente("  IMPO  -  Ley N° 6997  ")).toBe("IMPO");
  });

  it("devuelve cadena vacía si no hay nombre", () => {
    expect(nombreCortoFuente("")).toBe("");
  });
});
