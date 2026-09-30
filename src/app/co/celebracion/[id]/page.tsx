import type { Metadata } from "next";
import { cargarTodas } from "@/lib/celebraciones";
import VistaCelebracion, { metadataDeCelebracion } from "@/vistas/VistaCelebracion";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return cargarTodas().map((c) => ({ id: c.id }));
}

export async function generateMetadata(props: PageProps<"/co/celebracion/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return metadataDeCelebracion("co", id);
}

export default async function PaginaCelebracionColombia(props: PageProps<"/co/celebracion/[id]">) {
  const { id } = await props.params;
  return <VistaCelebracion pais="co" id={id} />;
}
