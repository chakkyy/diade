function Base({ children, tamanio }: { children: React.ReactNode; tamanio: number }) {
  return (
    <svg
      width={tamanio}
      height={tamanio}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconoHoy({ tamanio = 16 }: { tamanio?: number }) {
  return (
    <Base tamanio={tamanio}>
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </Base>
  );
}

export function IconoCalendario({ tamanio = 16 }: { tamanio?: number }) {
  return (
    <Base tamanio={tamanio}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Base>
  );
}

export function IconoBuscar({ tamanio = 16 }: { tamanio?: number }) {
  return (
    <Base tamanio={tamanio}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </Base>
  );
}

export function IconoFlecha({
  direccion,
  tamanio = 16,
}: {
  direccion: "anterior" | "siguiente";
  tamanio?: number;
}) {
  return (
    <svg
      width={tamanio}
      height={tamanio}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={direccion === "anterior" ? "-translate-x-px" : "translate-x-px"}
    >
      <path d={direccion === "anterior" ? "M14.5 5 7.5 12l7 7" : "M9.5 5l7 7-7 7"} />
    </svg>
  );
}
