import { describe, expect, it } from "vitest";
import {
  MESES,
  DIAS_SEMANA,
  esBisiesto,
  diasDelMes,
  hoyEnArgentina,
  slugDeFecha,
  fechaDeSlug,
  slugDeMes,
  mesDeSlug,
  fechaAnterior,
  fechaSiguiente,
  resolverFechaMovil,
  formatearFechaLarga,
  nombreDiaSemana,
  formatearFechaCorta,
  esFechaValida,
} from "@/lib/fechas";

describe("esBisiesto", () => {
  it("2024 es bisiesto", () => {
    expect(esBisiesto(2024)).toBe(true);
  });
  it("2023 no es bisiesto", () => {
    expect(esBisiesto(2023)).toBe(false);
  });
  it("1900 no es bisiesto (divisible por 100 no por 400)", () => {
    expect(esBisiesto(1900)).toBe(false);
  });
  it("2000 es bisiesto (divisible por 400)", () => {
    expect(esBisiesto(2000)).toBe(true);
  });
});

describe("diasDelMes", () => {
  it("febrero 2024 tiene 29 días", () => {
    expect(diasDelMes(2, 2024)).toBe(29);
  });
  it("febrero 2023 tiene 28 días", () => {
    expect(diasDelMes(2, 2023)).toBe(28);
  });
  it("abril tiene 30 días", () => {
    expect(diasDelMes(4, 2024)).toBe(30);
  });
  it("enero tiene 31 días", () => {
    expect(diasDelMes(1, 2024)).toBe(31);
  });
});

describe("hoyEnArgentina", () => {
  it("2026-09-12T01:30:00Z sigue siendo 11/9 viernes en Buenos Aires", () => {
    const r = hoyEnArgentina(new Date("2026-09-12T01:30:00Z"));
    expect(r).toEqual({ dia: 11, mes: 9, anio: 2026, diaSemana: 5 });
  });
  it("2026-09-12T03:30:00Z ya es 12/9 sábado en Buenos Aires", () => {
    const r = hoyEnArgentina(new Date("2026-09-12T03:30:00Z"));
    expect(r).toEqual({ dia: 12, mes: 9, anio: 2026, diaSemana: 6 });
  });
});

describe("slugDeFecha", () => {
  it("11 de septiembre", () => {
    expect(slugDeFecha({ dia: 11, mes: 9 })).toBe("11-septiembre");
  });
  it("1 de enero, sin cero a la izquierda", () => {
    expect(slugDeFecha({ dia: 1, mes: 1 })).toBe("1-enero");
  });
});

describe("fechaDeSlug", () => {
  it("acepta 11-septiembre", () => {
    expect(fechaDeSlug("11-septiembre")).toEqual({ dia: 11, mes: 9 });
  });
  it("acepta cero a la izquierda 01-septiembre", () => {
    expect(fechaDeSlug("01-septiembre")).toEqual({ dia: 1, mes: 9 });
  });
  it("es case-insensitive", () => {
    expect(fechaDeSlug("1-Septiembre")).toEqual({ dia: 1, mes: 9 });
  });
  it("devuelve null si el mes no existe", () => {
    expect(fechaDeSlug("11-inventado")).toBeNull();
  });
  it("devuelve null si el día está fuera de rango (29 de febrero usa tope 29)", () => {
    expect(fechaDeSlug("30-febrero")).toBeNull();
    expect(fechaDeSlug("29-febrero")).toEqual({ dia: 29, mes: 2 });
  });
  it("devuelve null con formato inválido", () => {
    expect(fechaDeSlug("no-es-una-fecha")).toBeNull();
    expect(fechaDeSlug("septiembre")).toBeNull();
  });
});

describe("slugDeMes / mesDeSlug", () => {
  it("slugDeMes(9) es septiembre", () => {
    expect(slugDeMes(9)).toBe("septiembre");
  });
  it("mesDeSlug es case-insensitive", () => {
    expect(mesDeSlug("Septiembre")).toBe(9);
  });
  it("mesDeSlug devuelve null si no existe", () => {
    expect(mesDeSlug("inventado")).toBeNull();
  });
});

describe("fechaAnterior / fechaSiguiente", () => {
  it("31 de diciembre siguiente da la vuelta a 1 de enero", () => {
    expect(fechaSiguiente({ dia: 31, mes: 12 }, 2026)).toEqual({ dia: 1, mes: 1 });
  });
  it("1 de enero anterior da la vuelta a 31 de diciembre", () => {
    expect(fechaAnterior({ dia: 1, mes: 1 }, 2026)).toEqual({ dia: 31, mes: 12 });
  });
  it("28 de febrero siguiente en año no bisiesto saltea al 1 de marzo", () => {
    expect(fechaSiguiente({ dia: 28, mes: 2 }, 2023)).toEqual({ dia: 1, mes: 3 });
  });
  it("28 de febrero siguiente en año bisiesto da 29 de febrero", () => {
    expect(fechaSiguiente({ dia: 28, mes: 2 }, 2024)).toEqual({ dia: 29, mes: 2 });
  });
  it("1 de marzo anterior en año no bisiesto da 28 de febrero", () => {
    expect(fechaAnterior({ dia: 1, mes: 3 }, 2023)).toEqual({ dia: 28, mes: 2 });
  });
});

describe("resolverFechaMovil", () => {
  it("3er domingo de octubre 2026 es el 18/10", () => {
    expect(resolverFechaMovil({ mes: 10, ordinal: 3, diaSemana: 0 }, 2026)).toEqual({ dia: 18, mes: 10 });
  });
  it("3er domingo de junio 2026 es el 21/6", () => {
    expect(resolverFechaMovil({ mes: 6, ordinal: 3, diaSemana: 0 }, 2026)).toEqual({ dia: 21, mes: 6 });
  });
  it("último domingo de noviembre 2026 es el 29/11", () => {
    expect(resolverFechaMovil({ mes: 11, ordinal: -1, diaSemana: 0 }, 2026)).toEqual({ dia: 29, mes: 11 });
  });
  it("3er domingo de agosto 2026 es el 16/8", () => {
    expect(resolverFechaMovil({ mes: 8, ordinal: 3, diaSemana: 0 }, 2026)).toEqual({ dia: 16, mes: 8 });
  });
});

describe("formatearFechaLarga / formatearFechaCorta", () => {
  it("formatearFechaLarga incluye el día de la semana calculado con Date.UTC", () => {
    expect(formatearFechaLarga({ dia: 11, mes: 9 }, 2026)).toBe("viernes 11 de septiembre");
  });
  it("formatearFechaCorta no incluye día de la semana", () => {
    expect(formatearFechaCorta({ dia: 11, mes: 9 })).toBe("11 de septiembre");
  });
});

describe("esFechaValida", () => {
  it("29 de febrero es válido en año bisiesto", () => {
    expect(esFechaValida({ dia: 29, mes: 2 }, 2024)).toBe(true);
  });
  it("29 de febrero no es válido en año no bisiesto", () => {
    expect(esFechaValida({ dia: 29, mes: 2 }, 2023)).toBe(false);
  });
  it("32 de enero no es válido", () => {
    expect(esFechaValida({ dia: 32, mes: 1 }, 2024)).toBe(false);
  });
});

it("MESES y DIAS_SEMANA tienen el orden esperado", () => {
  expect(MESES[0]).toBe("enero");
  expect(MESES[8]).toBe("septiembre");
  expect(DIAS_SEMANA[0]).toBe("domingo");
  expect(DIAS_SEMANA[5]).toBe("viernes");
});

describe("nombreDiaSemana", () => {
  it("el 11 de septiembre de 2026 es viernes", () => {
    expect(nombreDiaSemana({ dia: 11, mes: 9 }, 2026)).toBe("viernes");
  });
  it("el 1 de enero de 2027 es viernes", () => {
    expect(nombreDiaSemana({ dia: 1, mes: 1 }, 2027)).toBe("viernes");
  });
});
