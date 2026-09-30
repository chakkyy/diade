import { describe, expect, it } from "vitest";
import {
  PAISES,
  grupoDeAlcance,
  paisDeAlcance,
  paisDeRuta,
  prioridadDeAlcance,
  rutaDePais,
  rutaEnOtroPais,
} from "@/lib/paises";

describe("PAISES", () => {
  it("define Argentina sin prefijo y Colombia en /co con su zona", () => {
    expect(PAISES.ar.prefijo).toBe("");
    expect(PAISES.co.prefijo).toBe("/co");
    expect(PAISES.co.zona).toBe("America/Bogota");
    expect(PAISES.co.alcance).toBe("colombia");
  });
});

describe("rutaDePais", () => {
  it("deja las rutas de Argentina como están", () => {
    expect(rutaDePais("ar", "/")).toBe("/");
    expect(rutaDePais("ar", "/buscar")).toBe("/buscar");
  });
  it("antepone /co y no deja barra final en la home", () => {
    expect(rutaDePais("co", "/")).toBe("/co");
    expect(rutaDePais("co", "/fecha/11-septiembre")).toBe("/co/fecha/11-septiembre");
  });
});

describe("paisDeRuta", () => {
  it("reconoce /co exacto y sus subrutas", () => {
    expect(paisDeRuta("/co")).toBe("co");
    expect(paisDeRuta("/co/")).toBe("co");
    expect(paisDeRuta("/co/buscar")).toBe("co");
  });
  it("no confunde rutas que empiezan con co", () => {
    expect(paisDeRuta("/comida")).toBe("ar");
    expect(paisDeRuta("/cosas/co")).toBe("ar");
    expect(paisDeRuta("/")).toBe("ar");
    expect(paisDeRuta("/celebracion/co")).toBe("ar");
  });
});

describe("rutaEnOtroPais", () => {
  it("lleva la misma página al otro país en los dos sentidos", () => {
    expect(rutaEnOtroPais("/", "co")).toBe("/co");
    expect(rutaEnOtroPais("/co", "ar")).toBe("/");
    expect(rutaEnOtroPais("/co/", "ar")).toBe("/");
    expect(rutaEnOtroPais("/fecha/11-septiembre", "co")).toBe("/co/fecha/11-septiembre");
    expect(rutaEnOtroPais("/co/calendario/mayo", "ar")).toBe("/calendario/mayo");
  });
  it("es idempotente si el destino es el país actual", () => {
    expect(rutaEnOtroPais("/co/buscar", "co")).toBe("/co/buscar");
    expect(rutaEnOtroPais("/buscar", "ar")).toBe("/buscar");
  });
});

describe("grupoDeAlcance y prioridadDeAlcance", () => {
  it("el alcance del país que mira es local", () => {
    expect(grupoDeAlcance("argentina", "ar")).toBe("local");
    expect(grupoDeAlcance("colombia", "co")).toBe("local");
  });
  it("el vecino y otro-pais caen en otros", () => {
    expect(grupoDeAlcance("colombia", "ar")).toBe("otros");
    expect(grupoDeAlcance("argentina", "co")).toBe("otros");
    expect(grupoDeAlcance("otro-pais", "co")).toBe("otros");
  });
  it("ordena local, internacional, otros", () => {
    expect(prioridadDeAlcance("colombia", "co")).toBeLessThan(prioridadDeAlcance("internacional", "co"));
    expect(prioridadDeAlcance("internacional", "co")).toBeLessThan(prioridadDeAlcance("argentina", "co"));
  });
});

describe("paisDeAlcance", () => {
  it("devuelve el país de un alcance propio y null para el resto", () => {
    expect(paisDeAlcance("colombia")?.codigo).toBe("co");
    expect(paisDeAlcance("argentina")?.codigo).toBe("ar");
    expect(paisDeAlcance("internacional")).toBeNull();
    expect(paisDeAlcance("otro-pais")).toBeNull();
  });
});
