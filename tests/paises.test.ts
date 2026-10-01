import { describe, expect, it } from "vitest";
import { ALCANCES } from "@/types/celebracion";
import { ALCANCES_EFEMERIDE } from "@/types/efemeride";
import {
  PAISES,
  busquedaParaPais,
  esClicSimple,
  grupoDeAlcance,
  paisDeAlcance,
  paisDeParametro,
  CODIGOS_PAIS,
  PARAMETROS_PAIS,
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
  it("define Venezuela en /ve con hora de Caracas", () => {
    expect(PAISES.ve).toMatchObject({
      alcance: "venezuela",
      nombre: "Venezuela",
      bandera: "🇻🇪",
      zona: "America/Caracas",
      locale: "es_VE",
      prefijo: "/ve",
      ciudad: "Caracas",
    });
  });
  it("cada país tiene su alcance en ALCANCES y ALCANCES_EFEMERIDE", () => {
    for (const codigo of CODIGOS_PAIS) {
      expect(ALCANCES).toContain(PAISES[codigo].alcance);
      expect(ALCANCES_EFEMERIDE).toContain(PAISES[codigo].alcance);
    }
  });
  it("cada país tiene un código igual a su clave y un prefijo propio", () => {
    expect(new Set(CODIGOS_PAIS.map((c) => PAISES[c].prefijo)).size).toBe(CODIGOS_PAIS.length);
    for (const codigo of CODIGOS_PAIS) expect(PAISES[codigo].codigo).toBe(codigo);
  });
});

describe("paisDeParametro", () => {
  it("acepta todos los países con prefijo y devuelve su código", () => {
    for (const codigo of CODIGOS_PAIS) {
      const prefijo = PAISES[codigo].prefijo;
      if (prefijo === "") continue;
      expect(paisDeParametro(prefijo.slice(1))).toBe(codigo);
    }
  });
  it("rechaza Argentina, que no tiene prefijo, y cualquier otro valor", () => {
    expect(PAISES.ar.prefijo).toBe("");
    expect(paisDeParametro(PAISES.ar.codigo)).toBeNull();
    expect(paisDeParametro("xx")).toBeNull();
    expect(paisDeParametro("comida")).toBeNull();
    expect(paisDeParametro("")).toBeNull();
    expect(paisDeParametro("CO")).toBeNull();
  });
  it("PARAMETROS_PAIS lista los países con prefijo", () => {
    const conPrefijo = CODIGOS_PAIS.filter((codigo) => PAISES[codigo].prefijo !== "");
    expect(PARAMETROS_PAIS).toHaveLength(conPrefijo.length);
    for (const parametro of PARAMETROS_PAIS) expect(paisDeParametro(parametro)).not.toBeNull();
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
  it("reconoce /ve exacto y sus subrutas", () => {
    expect(paisDeRuta("/ve")).toBe("ve");
    expect(paisDeRuta("/ve/fecha/20-julio")).toBe("ve");
    expect(paisDeRuta("/venezuela")).toBe("ar");
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

describe("rutas de Venezuela", () => {
  it("rutaDePais y rutaEnOtroPais usan /ve", () => {
    expect(rutaDePais("ve", "/")).toBe("/ve");
    expect(rutaDePais("ve", "/buscar")).toBe("/ve/buscar");
    expect(rutaEnOtroPais("/co/calendario/mayo", "ve")).toBe("/ve/calendario/mayo");
    expect(rutaEnOtroPais("/ve", "ar")).toBe("/");
  });
  it("busquedaParaPais descarta el alcance de los vecinos", () => {
    expect(busquedaParaPais("?alcance=colombia&alcance=venezuela", "ve")).toBe("?alcance=venezuela");
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
  it("devuelve Venezuela para su alcance", () => {
    expect(paisDeAlcance("venezuela")?.codigo).toBe("ve");
    expect(grupoDeAlcance("venezuela", "ve")).toBe("local");
    expect(grupoDeAlcance("venezuela", "co")).toBe("otros");
  });
  it("devuelve el país de un alcance propio y null para el resto", () => {
    expect(paisDeAlcance("colombia")?.codigo).toBe("co");
    expect(paisDeAlcance("argentina")?.codigo).toBe("ar");
    expect(paisDeAlcance("internacional")).toBeNull();
    expect(paisDeAlcance("otro-pais")).toBeNull();
  });
});

describe("busquedaParaPais", () => {
  it("conserva el texto y la categoría y descarta el alcance del vecino", () => {
    expect(busquedaParaPais("?q=maestro&alcance=argentina&categoria=educacion", "co")).toBe(
      "?q=maestro&categoria=educacion",
    );
  });
  it("conserva internacional y otro-pais", () => {
    expect(busquedaParaPais("?alcance=internacional&alcance=otro-pais", "co")).toBe(
      "?alcance=internacional&alcance=otro-pais",
    );
  });
  it("devuelve vacío si no queda nada", () => {
    expect(busquedaParaPais("?alcance=colombia", "ar")).toBe("");
    expect(busquedaParaPais("", "co")).toBe("");
  });
});

describe("esClicSimple", () => {
  const base = { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, button: 0 };
  it("acepta el clic primario sin modificadores", () => {
    expect(esClicSimple(base)).toBe(true);
  });
  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"] as const)("rechaza con %s", (tecla) => {
    expect(esClicSimple({ ...base, [tecla]: true })).toBe(false);
  });
  it("rechaza el botón del medio", () => {
    expect(esClicSimple({ ...base, button: 1 })).toBe(false);
  });
});
