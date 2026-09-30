import { redirect } from "next/navigation";
import { connection } from "next/server";
import { hoyEn, slugDeMes } from "@/lib/fechas";
import { rutaDePais } from "@/lib/paises";

export default async function PaginaCalendarioColombia() {
  await connection();
  redirect(rutaDePais("co", `/calendario/${slugDeMes(hoyEn("co").mes)}`));
}
