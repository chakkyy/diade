import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Qué se celebra hoy en Colombia y en el mundo: días profesionales, efemérides y conmemoraciones, cada una con fuente verificable.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "¿Qué se celebra hoy?",
    title: "¿Qué se celebra hoy?",
    description: "Qué se celebra hoy en Colombia y en el mundo, con fuente verificable y horario de Bogotá.",
  },
};

export default function LayoutColombia({ children }: LayoutProps<"/co">) {
  return children;
}
