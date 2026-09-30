import { redirect } from "next/navigation";
import { connection } from "next/server";
import { hoyEn, slugDeMes } from "@/lib/fechas";

export default async function PaginaCalendario() {
  await connection();
  const hoy = hoyEn("ar");
  redirect(`/calendario/${slugDeMes(hoy.mes)}`);
}
