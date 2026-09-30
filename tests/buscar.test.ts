import { describe, expect, it } from "vitest";
import { normalizar, buscar, alcancesDeFiltro, ETIQUETAS_CATEGORIA, ETIQUETAS_ALCANCE } from "@/lib/buscar";
import type { ItemIndice } from "@/types/celebracion";

const indice: ItemIndice[] = [
  {
    id: "dia-del-fotografo",
    nombre: "Día del Fotógrafo",
    descripcion: "Homenaje a los fotógrafos argentinos.",
    alcance: "argentina",
    categoria: "profesion",
    fecha: { dia: 21, mes: 9 },
  },
  {
    id: "dia-del-terapista-ocupacional",
    nombre: "Día del Terapista Ocupacional",
    descripcion: "Reconoce a los profesionales de terapia ocupacional.",
    alcance: "argentina",
    categoria: "profesion",
    fecha: { dia: 10, mes: 9 },
  },
  {
    id: "dia-del-maestro",
    nombre: "Día del Maestro",
    descripcion: "Homenaje a Sarmiento y a los docentes argentinos.",
    alcance: "argentina",
    categoria: "educacion",
    tags: ["docente", "profesor"],
    fecha: { dia: 11, mes: 9 },
  },
  {
    id: "dia-panamericano-del-maestro",
    nombre: "Día Panamericano del Maestro",
    descripcion: "Celebración panamericana de la docencia.",
    alcance: "internacional",
    categoria: "educacion",
    fecha: { dia: 11, mes: 9 },
  },
  {
    id: "dia-del-maestro-colombia",
    nombre: "Día del Maestro en Colombia",
    descripcion: "Homenaje a los docentes colombianos.",
    alcance: "colombia",
    categoria: "educacion",
    fecha: { dia: 15, mes: 5 },
  },
  {
    id: "dia-del-medico-chile",
    nombre: "Día del Médico",
    descripcion: "Celebración chilena de la profesión médica.",
    alcance: "otro-pais",
    pais: "Chile",
    categoria: "salud",
    fecha: { dia: 15, mes: 10 },
  },
];

describe("normalizar", () => {
  it("pasa a minúsculas", () => {
    expect(normalizar("HOLA Mundo")).toBe("hola mundo");
  });
  it("quita tildes y diacríticos", () => {
    expect(normalizar("Fotógrafo")).toBe("fotografo");
  });
  it("colapsa espacios múltiples y hace trim", () => {
    expect(normalizar("  hola   mundo  ")).toBe("hola mundo");
  });
});

describe("buscar", () => {
  it("query vacía devuelve todo", () => {
    expect(buscar(indice, "", { pais: "ar" }).length).toBe(indice.length);
  });
  it("'fotografo' sin tilde encuentra Día del Fotógrafo", () => {
    const r = buscar(indice, "fotografo", { pais: "ar" });
    expect(r.map((i) => i.id)).toEqual(["dia-del-fotografo"]);
  });
  it("'terapista' y 'ocupacional' encuentran Día del Terapista Ocupacional", () => {
    expect(buscar(indice, "terapista", { pais: "ar" }).map((i) => i.id)).toEqual(["dia-del-terapista-ocupacional"]);
    expect(buscar(indice, "ocupacional", { pais: "ar" }).map((i) => i.id)).toEqual(["dia-del-terapista-ocupacional"]);
    expect(buscar(indice, "terapista ocupacional", { pais: "ar" }).map((i) => i.id)).toEqual(["dia-del-terapista-ocupacional"]);
  });
  it("'maestro' encuentra ambos, con el argentino primero (coincidencia en nombre, desempate por alcance)", () => {
    const r = buscar(indice, "maestro", { pais: "ar" });
    expect(r.map((i) => i.id)).toEqual([
      "dia-del-maestro",
      "dia-panamericano-del-maestro",
      "dia-del-maestro-colombia",
    ]);
  });
  it("busca por tag: 'docente' encuentra Día del Maestro", () => {
    expect(buscar(indice, "docente", { pais: "ar" }).map((i) => i.id)).toEqual([
      "dia-del-maestro",
      "dia-del-maestro-colombia",
    ]);
  });
  it("filtro de alcance excluye internacionales", () => {
    const r = buscar(indice, "maestro", { pais: "ar", alcance: ["argentina"] });
    expect(r.map((i) => i.id)).toEqual(["dia-del-maestro"]);
  });
  it("filtro de categoria combinado con query", () => {
    const r = buscar(indice, "dia", { pais: "ar", categoria: ["salud"] });
    expect(r.map((i) => i.id)).toEqual(["dia-del-medico-chile"]);
  });
  it("query vacía respeta filtros", () => {
    const r = buscar(indice, "", { pais: "ar", alcance: ["otro-pais"] });
    expect(r.map((i) => i.id).sort()).toEqual(["dia-del-maestro-colombia", "dia-del-medico-chile"]);
  });
});

describe("buscar por país", () => {
  it("con texto, el país local va primero", () => {
    const co = buscar(indice, "maestro", { pais: "co" }).map((i) => i.id);
    expect(co[0]).toBe("dia-del-maestro-colombia");
    const ar = buscar(indice, "maestro", { pais: "ar" }).map((i) => i.id);
    expect(ar[0]).toBe("dia-del-maestro");
  });
  it("el filtro otro-pais incluye al vecino", () => {
    const ar = buscar(indice, "", { pais: "ar", alcance: ["otro-pais"] }).map((i) => i.id);
    expect(ar).toContain("dia-del-maestro-colombia");
    const co = buscar(indice, "", { pais: "co", alcance: ["otro-pais"] }).map((i) => i.id);
    expect(co).toContain("dia-del-maestro");
    expect(co).not.toContain("dia-del-maestro-colombia");
  });
  it("alcancesDeFiltro ofrece local, internacional y otros", () => {
    expect(alcancesDeFiltro("co")).toEqual(["colombia", "internacional", "otro-pais"]);
    expect(alcancesDeFiltro("ar")).toEqual(["argentina", "internacional", "otro-pais"]);
  });
});

describe("ETIQUETAS_CATEGORIA / ETIQUETAS_ALCANCE", () => {
  it("tiene etiquetas legibles en español", () => {
    expect(ETIQUETAS_CATEGORIA.profesion).toBe("Profesión");
    expect(ETIQUETAS_CATEGORIA.tecnologia).toBe("Tecnología");
    expect(ETIQUETAS_ALCANCE.argentina).toBe("Argentina");
    expect(ETIQUETAS_ALCANCE["otro-pais"]).toBe("Otros países");
  });
});
