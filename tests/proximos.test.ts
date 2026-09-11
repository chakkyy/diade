import { describe, expect, it } from "vitest";
import { proximosDestacados, textoEnDias } from "@/lib/proximos";
import type { Celebracion, FechaCelebracion } from "@/types/celebracion";

function celebracion(
  id: string,
  fecha: FechaCelebracion,
  destacado: boolean,
): Celebracion {
  return {
    id,
    nombre: id,
    fecha,
    alcance: "argentina",
    categoria: "cultura",
    descripcion: "Fixture.",
    fuentes: [{ nombre: "Fixture", url: "https://ejemplo.test", tipo: "institucional" }],
    destacado,
    verificadoEn: "2026-09-11",
  };
}

const PRIMAVERA = celebracion("primavera", { dia: 21, mes: 9 }, true);
const MAESTRO = celebracion("maestro", { dia: 11, mes: 9 }, true);
const ESCRITOR = celebracion("escritor", { dia: 13, mes: 6 }, true);
const MADRE = celebracion("madre", { mes: 10, ordinal: 3, diaSemana: 0 }, true);
const NAVIDAD = celebracion("navidad", { dia: 25, mes: 12 }, true);
const ANIO_NUEVO = celebracion("anio-nuevo", { dia: 1, mes: 1 }, true);
const COMUN = celebracion("comun", { dia: 12, mes: 9 }, false);

const TODAS = [PRIMAVERA, MAESTRO, ESCRITOR, MADRE, NAVIDAD, ANIO_NUEVO, COMUN];

describe("proximosDestacados", () => {
  it("devuelve los destacados siguientes ordenados por cercanía", () => {
    const proximos = proximosDestacados({ dia: 11, mes: 9 }, 2026, 3, TODAS);
    expect(proximos.map((p) => p.celebracion.id)).toEqual(["primavera", "madre", "navidad"]);
    expect(proximos.map((p) => p.enDias)).toEqual([10, 37, 105]);
  });

  it("resuelve las fechas móviles del año que se está viendo", () => {
    const [, madre] = proximosDestacados({ dia: 11, mes: 9 }, 2026, 3, TODAS);
    expect(madre.fecha).toEqual({ dia: 18, mes: 10 });
  });

  it("excluye el mismo día y las celebraciones sin destacado", () => {
    const ids = proximosDestacados({ dia: 11, mes: 9 }, 2026, 5, TODAS).map((p) => p.celebracion.id);
    expect(ids).not.toContain("maestro");
    expect(ids).not.toContain("comun");
  });

  it("da la vuelta al año", () => {
    const proximos = proximosDestacados({ dia: 30, mes: 12 }, 2026, 2, TODAS);
    expect(proximos[0].celebracion.id).toBe("anio-nuevo");
    expect(proximos[0].enDias).toBe(2);
    expect(proximos[1].celebracion.id).toBe("escritor");
  });

  it("respeta la cantidad pedida", () => {
    expect(proximosDestacados({ dia: 11, mes: 9 }, 2026, 1, TODAS)).toHaveLength(1);
    expect(proximosDestacados({ dia: 11, mes: 9 }, 2026, 0, TODAS)).toHaveLength(0);
  });

  it("devuelve vacío si no hay destacados", () => {
    expect(proximosDestacados({ dia: 11, mes: 9 }, 2026, 3, [COMUN])).toEqual([]);
  });

  it("saltea el 29 de febrero en años no bisiestos", () => {
    const bisiesto = celebracion("bisiesto", { dia: 29, mes: 2 }, true);
    const proximos = proximosDestacados({ dia: 20, mes: 2 }, 2027, 1, [bisiesto]);
    expect(proximos[0].fecha).toEqual({ dia: 29, mes: 2 });
    expect(proximos[0].enDias).toBe(374);
  });
});

describe("textoEnDias", () => {
  it("llama mañana al día siguiente", () => {
    expect(textoEnDias(1)).toBe("mañana");
  });

  it("cuenta los días en plural", () => {
    expect(textoEnDias(10)).toBe("en 10 días");
  });
});
