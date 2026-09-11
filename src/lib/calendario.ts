import { diasDelMes } from "@/lib/fechas";

export function celdasDelMes(mes: number, anio: number): (number | null)[] {
  const diaSemanaPrimero = new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay();
  const huecosIniciales = (diaSemanaPrimero + 6) % 7;
  const totalDias = diasDelMes(mes, anio);

  const celdas: (number | null)[] = [];
  for (let i = 0; i < huecosIniciales; i++) celdas.push(null);
  for (let dia = 1; dia <= totalDias; dia++) celdas.push(dia);
  while (celdas.length % 7 !== 0) celdas.push(null);

  return celdas;
}

export function mesAnterior(mes: number): number {
  return mes === 1 ? 12 : mes - 1;
}

export function mesSiguiente(mes: number): number {
  return mes === 12 ? 1 : mes + 1;
}
