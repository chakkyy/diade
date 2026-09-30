import type { Metadata } from "next";
import { connection } from "next/server";
import VistaHoy, { metadataDeHoy } from "@/vistas/VistaHoy";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  return metadataDeHoy("co");
}

export default async function HomeColombia() {
  await connection();
  return <VistaHoy pais="co" />;
}
