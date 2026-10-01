import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

const urls = sitemap().map((e) => e.url.replace(/^https?:\/\/[^/]+/, "") || "/");

describe("sitemap", () => {
  it("conserva las rutas de Argentina", () => {
    expect(urls).toContain("/");
    expect(urls).toContain("/buscar");
    expect(urls).toContain("/calendario/septiembre");
    expect(urls).toContain("/fecha/29-febrero");
  });
  it("suma las rutas de Colombia", () => {
    expect(urls).toContain("/co");
    expect(urls).toContain("/co/buscar");
    expect(urls).toContain("/co/calendario/septiembre");
    expect(urls).toContain("/co/fecha/29-febrero");
    expect(urls.filter((u) => u.startsWith("/co/fecha/"))).toHaveLength(366);
  });
  it("suma las rutas de Venezuela", () => {
    expect(urls).toContain("/ve");
    expect(urls).toContain("/ve/buscar");
    expect(urls).toContain("/ve/calendario/septiembre");
    expect(urls).toContain("/ve/fecha/29-febrero");
    expect(urls.filter((u) => u.startsWith("/ve/fecha/"))).toHaveLength(366);
    expect(urls.some((u) => u.startsWith("/ve/celebracion/"))).toBe(false);
  });
  it("cada celebración figura una sola vez, sin prefijo de país", () => {
    expect(urls.some((u) => u.startsWith("/co/celebracion/"))).toBe(false);
    const celebraciones = urls.filter((u) => u.startsWith("/celebracion/"));
    expect(new Set(celebraciones).size).toBe(celebraciones.length);
  });
});
