export type DireccionSwipe = "anterior" | "siguiente";

export function decidirSwipe({
  dx,
  dy,
  umbral,
}: {
  dx: number;
  dy: number;
  umbral: number;
}): DireccionSwipe | null {
  if (Math.abs(dx) < umbral) return null;
  if (Math.abs(dx) <= Math.abs(dy)) return null;
  return dx > 0 ? "anterior" : "siguiente";
}
