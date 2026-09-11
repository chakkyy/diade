import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import TabBar from "@/components/TabBar";
import ThemeToggle from "@/components/ThemeToggle";
import { IconoBuscar, IconoCalendario } from "@/components/iconos";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(sitio),
  title: {
    default: "¿Qué se celebra hoy?",
    template: "%s · ¿Qué se celebra hoy?",
  },
  description:
    "Qué se celebra hoy en Argentina y en el mundo: días profesionales, efemérides y conmemoraciones, cada una con fuente verificable.",
  applicationName: "¿Qué se celebra hoy?",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "¿Qué se celebra hoy?",
    title: "¿Qué se celebra hoy?",
    description:
      "Qué se celebra hoy en Argentina y en el mundo, con fuente verificable y horario de Buenos Aires.",
  },
};

const scriptTema = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.add(d?"dark":"light")}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="flex min-h-full flex-col bg-fondo pb-[calc(58px+env(safe-area-inset-bottom))] text-texto sm:pb-0">
        <header className="sticky top-0 z-20 border-b border-borde bg-fondo/90 backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4">
            <Link
              href="/"
              className="mr-auto shrink-0 text-[13px] font-semibold tracking-tight sm:text-sm"
            >
              ¿Qué se celebra hoy?
            </Link>
            <nav aria-label="Secciones" className="hidden items-center gap-1 sm:flex">
              <Link
                href="/calendario"
                className="flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[13px] text-texto-secundario transition-colors duration-150 hover:bg-superficie-suave hover:text-texto"
              >
                <IconoCalendario />
                <span>Calendario</span>
              </Link>
              <Link
                href="/buscar"
                className="flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[13px] text-texto-secundario transition-colors duration-150 hover:bg-superficie-suave hover:text-texto"
              >
                <IconoBuscar />
                <span>Buscar</span>
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-2xl px-4 pb-16">{children}</div>
        </main>
        <footer className="border-t border-borde">
          <div className="mx-auto w-full max-w-2xl px-4 py-6 text-[13px] leading-relaxed text-texto-secundario">
            Datos con fuente verificable · Zona horaria Argentina
          </div>
        </footer>
        <TabBar />
      </body>
    </html>
  );
}
