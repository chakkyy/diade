import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { hoyEn, slugDeMes } from "@/lib/fechas";
import { paisDeParametro, rutaDePais } from "@/lib/paises";

export default async function PaginaCalendarioPais(props: PageProps<"/[pais]/calendario">) {
  await connection();
  const pais = paisDeParametro((await props.params).pais);
  if (!pais) notFound();
  redirect(rutaDePais(pais, `/calendario/${slugDeMes(hoyEn(pais).mes)}`));
}
