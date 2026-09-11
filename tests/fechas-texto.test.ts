import { describe, expect, it } from "vitest";
import { describirFecha } from "@/lib/fechas-texto";

describe("describirFecha", () => {
  it("fecha fija: 11 de septiembre", () => {
    expect(describirFecha({ dia: 11, mes: 9 }, 2026)).toBe("11 de septiembre");
  });
  it("fecha fija: 1 de enero", () => {
    expect(describirFecha({ dia: 1, mes: 1 }, 2026)).toBe("1 de enero");
  });
  it("fecha móvil: 3er domingo de octubre", () => {
    expect(describirFecha({ mes: 10, ordinal: 3, diaSemana: 0 }, 2026)).toBe("tercer domingo de octubre");
  });
  it("fecha móvil: último domingo de noviembre", () => {
    expect(describirFecha({ mes: 11, ordinal: -1, diaSemana: 0 }, 2026)).toBe("último domingo de noviembre");
  });
  it("fecha móvil: primer lunes de mayo", () => {
    expect(describirFecha({ mes: 5, ordinal: 1, diaSemana: 1 }, 2026)).toBe("primer lunes de mayo");
  });
  it("fecha móvil: segundo martes de junio", () => {
    expect(describirFecha({ mes: 6, ordinal: 2, diaSemana: 2 }, 2026)).toBe("segundo martes de junio");
  });
  it("fecha móvil: cuarto sábado de agosto", () => {
    expect(describirFecha({ mes: 8, ordinal: 4, diaSemana: 6 }, 2026)).toBe("cuarto sábado de agosto");
  });
  it("no depende del año para el texto de una fecha móvil", () => {
    const a = describirFecha({ mes: 10, ordinal: 3, diaSemana: 0 }, 2025);
    const b = describirFecha({ mes: 10, ordinal: 3, diaSemana: 0 }, 2030);
    expect(a).toBe(b);
  });
});
