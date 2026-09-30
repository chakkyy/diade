import type { Metadata } from "next";
import VistaBuscar, { metadataDeBuscar } from "@/vistas/VistaBuscar";

export async function generateMetadata(props: PageProps<"/buscar">): Promise<Metadata> {
  return metadataDeBuscar("ar", await props.searchParams);
}

export default async function PaginaBuscar(props: PageProps<"/buscar">) {
  return <VistaBuscar pais="ar" searchParams={await props.searchParams} />;
}
