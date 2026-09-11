const SEPARADORES = [" - ", " – ", ":"];
const LARGO_MAXIMO = 40;

export function nombreCortoFuente(nombre: string): string {
  let corto = nombre.trim();

  for (const separador of SEPARADORES) {
    const corte = corto.indexOf(separador);
    if (corte > 0) corto = corto.slice(0, corte).trim();
  }

  if (corto.length <= LARGO_MAXIMO) return corto;
  return `${corto.slice(0, LARGO_MAXIMO - 1).trimEnd()}…`;
}
