import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  cargarTodas,
  celebracionesDeFecha,
  agruparPorAlcance,
  celebracionPorId,
  fechaResuelta,
  contarPorDia,
  indiceBusqueda,
} from "@/lib/celebraciones";

const dirFixtures = path.join(process.cwd(), "tests", "fixtures", "celebraciones");
const dirFixturasInvalidas = path.join(process.cwd(), "tests", "fixtures", "celebraciones-invalid");

describe("cargarTodas", () => {
  it("carga y valida las celebraciones del directorio de fixtures", () => {
    const todas = cargarTodas(dirFixtures);
    expect(todas).toHaveLength(5);
    expect(todas.map((c) => c.id)).toContain("dia-de-prueba-uno");
  });
  it("cachea el resultado por directorio", () => {
    const primera = cargarTodas(dirFixtures);
    const segunda = cargarTodas(dirFixtures);
    expect(primera).toBe(segunda);
  });
  it("lanza un Error con el nombre del archivo si la validación falla", () => {
    expect(() => cargarTodas(dirFixturasInvalidas)).toThrowError(/09\.json/);
  });
});

describe("celebracionesDeFecha", () => {
  const todas = cargarTodas(dirFixtures);

  it("en Argentina: argentina, internacional y después el vecino", () => {
    const r = celebracionesDeFecha({ dia: 10, mes: 9 }, 2026, "ar", todas);
    expect(r.map((c) => c.id)).toEqual(["dia-de-prueba-uno", "dia-de-prueba-dos", "dia-de-prueba-colombia"]);
  });
  it("en Colombia: colombia, internacional y después el vecino", () => {
    const r = celebracionesDeFecha({ dia: 10, mes: 9 }, 2026, "co", todas);
    expect(r.map((c) => c.id)).toEqual(["dia-de-prueba-colombia", "dia-de-prueba-dos", "dia-de-prueba-uno"]);
  });
  it("incluye móviles cuya resolución cae ese día", () => {
    const r = celebracionesDeFecha({ dia: 20, mes: 9 }, 2026, "ar", todas);
    expect(r.map((c) => c.id)).toEqual(["dia-movil-de-prueba"]);
  });
  it("un día sin celebraciones devuelve []", () => {
    expect(celebracionesDeFecha({ dia: 1, mes: 9 }, 2026, "co", todas)).toEqual([]);
  });
});

describe("agruparPorAlcance", () => {
  const todas = cargarTodas(dirFixtures);

  it("en Argentina, Colombia cae en otros junto a otro-pais", () => {
    const grupos = agruparPorAlcance(todas, "ar");
    expect(grupos.local.map((c) => c.id).sort()).toEqual(["dia-de-prueba-uno", "dia-movil-de-prueba"]);
    expect(grupos.internacional.map((c) => c.id)).toEqual(["dia-de-prueba-dos"]);
    expect(grupos.otros.map((c) => c.id).sort()).toEqual(["dia-de-prueba-colombia", "dia-de-prueba-tres"]);
  });
  it("en Colombia, Argentina cae en otros", () => {
    const grupos = agruparPorAlcance(todas, "co");
    expect(grupos.local.map((c) => c.id)).toEqual(["dia-de-prueba-colombia"]);
    expect(grupos.otros.map((c) => c.id).sort()).toEqual([
      "dia-de-prueba-tres",
      "dia-de-prueba-uno",
      "dia-movil-de-prueba",
    ]);
  });
});

describe("celebracionPorId", () => {
  const todas = cargarTodas(dirFixtures);

  it("encuentra por id", () => {
    expect(celebracionPorId("dia-de-prueba-uno", todas)?.nombre).toBe("Día de Prueba Uno");
  });
  it("devuelve undefined si no existe", () => {
    expect(celebracionPorId("no-existe", todas)).toBeUndefined();
  });
});

describe("fechaResuelta", () => {
  const todas = cargarTodas(dirFixtures);

  it("una fecha fija devuelve la misma fecha", () => {
    const c = celebracionPorId("dia-de-prueba-uno", todas)!;
    expect(fechaResuelta(c, 2026)).toEqual({ dia: 10, mes: 9 });
  });
  it("una fecha móvil se resuelve para el año pedido", () => {
    const c = celebracionPorId("dia-movil-de-prueba", todas)!;
    expect(fechaResuelta(c, 2026)).toEqual({ dia: 20, mes: 9 });
  });
});

describe("contarPorDia", () => {
  const todas = cargarTodas(dirFixtures);

  it("cuenta por día según el país que mira", () => {
    const ar = contarPorDia(9, 2026, "ar", todas);
    expect(ar.get(10)).toEqual({ total: 3, local: 1, internacional: 1, otros: 1 });
    expect(ar.get(15)).toEqual({ total: 1, local: 0, internacional: 0, otros: 1 });
    expect(ar.get(20)).toEqual({ total: 1, local: 1, internacional: 0, otros: 0 });
    expect(ar.get(1)).toBeUndefined();
    const co = contarPorDia(9, 2026, "co", todas);
    expect(co.get(10)).toEqual({ total: 3, local: 1, internacional: 1, otros: 1 });
    expect(co.get(20)).toEqual({ total: 1, local: 0, internacional: 0, otros: 1 });
  });
});

describe("indiceBusqueda", () => {
  it("expone solo los campos livianos, sin fuentes ni verificadoEn", () => {
    const todas = cargarTodas(dirFixtures);
    const indice = indiceBusqueda(todas);
    const uno = indice.find((i) => i.id === "dia-de-prueba-uno");
    expect(uno).toEqual({
      id: "dia-de-prueba-uno",
      nombre: "Día de Prueba Uno",
      descripcion: "Entrada ficticia usada solo para tests de la Unidad A.",
      alcance: "argentina",
      categoria: "profesion",
      fecha: { dia: 10, mes: 9 },
    });
    expect(indice).toHaveLength(5);
  });
});
