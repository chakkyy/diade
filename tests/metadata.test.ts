import { describe, expect, it } from "vitest";
import { metadataDeBuscar } from "@/vistas/VistaBuscar";
import { metadataDeCalendarioMes } from "@/vistas/VistaCalendarioMes";
import { metadataDeCelebracion } from "@/vistas/VistaCelebracion";
import { metadataDeFecha } from "@/vistas/VistaFecha";

const ID_ARGENTINA = "dia-del-maestro";
const ID_COLOMBIA = "dia-de-la-independencia-colombia";

describe("canonical de celebración", () => {
  it.each([ID_ARGENTINA, ID_COLOMBIA])("no lleva prefijo de país para %s", (id) => {
    expect(metadataDeCelebracion("co", id).alternates?.canonical).toBe(`/celebracion/${id}`);
    expect(metadataDeCelebracion("ar", id).alternates?.canonical).toBe(`/celebracion/${id}`);
    expect(metadataDeCelebracion("ve", id).alternates?.canonical).toBe(`/celebracion/${id}`);
  });
});

describe("locale de openGraph", () => {
  it("fecha", () => {
    expect(metadataDeFecha("co", "20-julio").openGraph).toMatchObject({ locale: "es_CO" });
    expect(metadataDeFecha("ar", "20-julio").openGraph).toMatchObject({ locale: "es_AR" });
    expect(metadataDeFecha("ve", "20-julio").openGraph).toMatchObject({ locale: "es_VE" });
  });
  it("calendario del mes", () => {
    expect(metadataDeCalendarioMes("co", "julio").openGraph).toMatchObject({ locale: "es_CO" });
    expect(metadataDeCalendarioMes("ar", "julio").openGraph).toMatchObject({ locale: "es_AR" });
    expect(metadataDeCalendarioMes("ve", "julio").openGraph).toMatchObject({ locale: "es_VE" });
  });
});

describe("canonical por país", () => {
  it("fecha", () => {
    expect(metadataDeFecha("co", "20-julio").alternates?.canonical).toBe("/co/fecha/20-julio");
    expect(metadataDeFecha("ar", "20-julio").alternates?.canonical).toBe("/fecha/20-julio");
    expect(metadataDeFecha("ve", "20-julio").alternates?.canonical).toBe("/ve/fecha/20-julio");
  });
  it("calendario del mes", () => {
    const co = metadataDeCalendarioMes("co", "julio");
    const ar = metadataDeCalendarioMes("ar", "julio");
    expect(co.alternates?.canonical).toBe("/co/calendario/julio");
    expect(co.description).toContain("Colombia");
    expect(ar.alternates?.canonical).toBe("/calendario/julio");
    expect(ar.description).toContain("Argentina");
    const ve = metadataDeCalendarioMes("ve", "julio");
    expect(ve.alternates?.canonical).toBe("/ve/calendario/julio");
    expect(ve.description).toContain("Venezuela");
  });
  it("buscar", () => {
    expect(metadataDeBuscar("co", {}).alternates?.canonical).toBe("/co/buscar");
    expect(metadataDeBuscar("ar", {}).alternates?.canonical).toBe("/buscar");
    expect(metadataDeBuscar("ve", {}).alternates?.canonical).toBe("/ve/buscar");
  });
});

describe("fecha argentina sin celebración colombiana", () => {
  it("título y descripción", () => {
    const metadata = metadataDeFecha("ar", "11-septiembre");
    expect(String(metadata.title)).toMatch(/^11 de septiembre: Día del Maestro/);
    expect(String(metadata.description)).toMatch(/Con fuentes? verificables?\.$/);
  });
});
