import { redirect } from "next/navigation";
import { connection } from "next/server";
import { hoyEnArgentina, slugDeMes } from "@/lib/fechas";

export default async function PaginaCalendario() {
  await connection();
  const hoy = hoyEnArgentina();
  redirect(`/calendario/${slugDeMes(hoy.mes)}`);
}
