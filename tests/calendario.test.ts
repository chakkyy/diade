import { describe, expect, it } from "vitest";
import { celdasDelMes, mesAnterior, mesSiguiente } from "@/lib/calendario";

describe("celdasDelMes", () => {
  it("septiembre 2026 empieza martes: 1 null inicial", () => {
    const celdas = celdasDelMes(9, 2026);
    expect(celdas[0]).toBeNull();
    expect(celdas[1]).toBe(1);
    expect(celdas[2]).toBe(2);
  });

  it("febrero 2026 empieza domingo: 6 nulls iniciales", () => {
    const celdas = celdasDelMes(2, 2026);
    for (let i = 0; i < 6; i++) {
      expect(celdas[i]).toBeNull();
    }
    expect(celdas[6]).toBe(1);
  });

  it("la longitud siempre es múltiplo de 7", () => {
    for (let mes = 1; mes <= 12; mes++) {
      const celdas = celdasDelMes(mes, 2026);
      expect(celdas.length % 7).toBe(0);
    }
  });

  it("contiene todos los días del mes en orden, sin huecos entre ellos", () => {
    const celdas = celdasDelMes(9, 2026);
    const dias = celdas.filter((c) => c !== null);
    expect(dias).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("no deja celdas colgando después del último día salvo nulls de relleno", () => {
    const celdas = celdasDelMes(2, 2026);
    const ultimoIndiceConDia: number = celdas.reduce<number>(
      (acc, c, i) => (c !== null ? i : acc),
      -1,
    );
    for (let i = ultimoIndiceConDia + 1; i < celdas.length; i++) {
      expect(celdas[i]).toBeNull();
    }
  });
});

describe("mesAnterior", () => {
  it("de un mes cualquiera resta uno", () => {
    expect(mesAnterior(9)).toBe(8);
  });
  it("de enero da la vuelta a diciembre", () => {
    expect(mesAnterior(1)).toBe(12);
  });
});

describe("mesSiguiente", () => {
  it("de un mes cualquiera suma uno", () => {
    expect(mesSiguiente(9)).toBe(10);
  });
  it("de diciembre da la vuelta a enero", () => {
    expect(mesSiguiente(12)).toBe(1);
  });
});
