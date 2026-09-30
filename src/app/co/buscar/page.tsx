import type { Metadata } from "next";
import VistaBuscar, { metadataDeBuscar } from "@/vistas/VistaBuscar";

export async function generateMetadata(props: PageProps<"/co/buscar">): Promise<Metadata> {
  return metadataDeBuscar("co", await props.searchParams);
}

export default async function PaginaBuscarColombia(props: PageProps<"/co/buscar">) {
  return <VistaBuscar pais="co" searchParams={await props.searchParams} />;
}
