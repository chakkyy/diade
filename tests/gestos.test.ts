import { describe, expect, it } from "vitest";
import { decidirSwipe } from "@/lib/gestos";

describe("decidirSwipe", () => {
  it("arrastrar hacia la derecha va al día anterior", () => {
    expect(decidirSwipe({ dx: 80, dy: 10, umbral: 60 })).toBe("anterior");
  });

  it("arrastrar hacia la izquierda va al día siguiente", () => {
    expect(decidirSwipe({ dx: -80, dy: 10, umbral: 60 })).toBe("siguiente");
  });

  it("toma el umbral como mínimo inclusivo", () => {
    expect(decidirSwipe({ dx: 60, dy: 0, umbral: 60 })).toBe("anterior");
    expect(decidirSwipe({ dx: -60, dy: 0, umbral: 60 })).toBe("siguiente");
  });

  it("ignora arrastres cortos", () => {
    expect(decidirSwipe({ dx: 50, dy: 5, umbral: 60 })).toBeNull();
    expect(decidirSwipe({ dx: -12, dy: 0, umbral: 60 })).toBeNull();
  });

  it("ignora arrastres más verticales que horizontales", () => {
    expect(decidirSwipe({ dx: 80, dy: 90, umbral: 60 })).toBeNull();
    expect(decidirSwipe({ dx: -80, dy: -120, umbral: 60 })).toBeNull();
  });

  it("usa el valor absoluto del desplazamiento vertical", () => {
    expect(decidirSwipe({ dx: -70, dy: -20, umbral: 60 })).toBe("siguiente");
  });

  it("ignora un toque sin desplazamiento", () => {
    expect(decidirSwipe({ dx: 0, dy: 0, umbral: 60 })).toBeNull();
  });
});
