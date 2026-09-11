import type { Celebracion } from "@/types/celebracion";
import { esFechaMovil } from "@/types/celebracion";

export function slugDeNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nombreArchivoMes(mes: number): string {
  return `${String(mes).padStart(2, "0")}.json`;
}

export function insertarOrdenado(lista: Celebracion[], nueva: Celebracion): Celebracion[] {
  const resultado = [...lista];
  if (esFechaMovil(nueva.fecha)) {
    resultado.push(nueva);
    return resultado;
  }
  const dia = nueva.fecha.dia;
  const indice = resultado.findIndex((c) => esFechaMovil(c.fecha) || c.fecha.dia > dia);
  if (indice === -1) {
    resultado.push(nueva);
  } else {
    resultado.splice(indice, 0, nueva);
  }
  return resultado;
}
