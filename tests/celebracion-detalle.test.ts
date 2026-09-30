import { describe, expect, it } from "vitest";
import { banderaDePais, etiquetaDeAlcance } from "@/lib/celebracion-detalle";

describe("etiquetaDeAlcance", () => {
  it("usa bandera y nombre de los países propios", () => {
    expect(etiquetaDeAlcance({ alcance: "argentina" })).toEqual({ bandera: "🇦🇷", texto: "Argentina" });
    expect(etiquetaDeAlcance({ alcance: "colombia" })).toEqual({ bandera: "🇨🇴", texto: "Colombia" });
  });
  it("internacional lleva el globo", () => {
    expect(etiquetaDeAlcance({ alcance: "internacional" })).toEqual({ bandera: "🌎", texto: "Internacional" });
  });
  it("otro-pais usa su pais y cae al genérico si falta", () => {
    expect(etiquetaDeAlcance({ alcance: "otro-pais", pais: "Chile" })).toEqual({ bandera: "🇨🇱", texto: "Chile" });
    expect(etiquetaDeAlcance({ alcance: "otro-pais", pais: "Eswatini" })).toEqual({ bandera: "🌐", texto: "Eswatini" });
    expect(etiquetaDeAlcance({ alcance: "otro-pais" })).toEqual({ bandera: "🌐", texto: "otro país" });
  });
});

describe("banderaDePais", () => {
  it("conoce a los países propios", () => {
    expect(banderaDePais("Colombia")).toBe("🇨🇴");
    expect(banderaDePais("Argentina")).toBe("🇦🇷");
  });
});
