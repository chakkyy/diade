"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";

const sinSuscripcion = () => () => {};
const enCliente = () => true;
const enServidor = () => false;

export default function TrasHidratar({ children }: { children: ReactNode }) {
  const montado = useSyncExternalStore(sinSuscripcion, enCliente, enServidor);
  return <Fragment key={montado ? "cliente" : "servidor"}>{children}</Fragment>;
}
