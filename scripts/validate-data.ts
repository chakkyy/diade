import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { archivoEfemeridesSchema, archivoMesSchema } from "../src/lib/schema";

interface Conjunto {
  carpeta: string;
  etiqueta: string;
  schema: z.ZodType<{ id: string; fecha: { mes: number } }[]>;
}

const CONJUNTOS: Conjunto[] = [
  { carpeta: "celebraciones", etiqueta: "celebraciones", schema: archivoMesSchema },
  { carpeta: "efemerides", etiqueta: "efemérides", schema: archivoEfemeridesSchema },
];

let errores = 0;

for (const { carpeta, etiqueta, schema } of CONJUNTOS) {
  const dir = path.join(process.cwd(), "data", carpeta);
  if (!fs.existsSync(dir)) {
    console.log(`– data/${carpeta} no existe, se omite`);
    continue;
  }
  const archivos = fs.readdirSync(dir).filter((f) => /^\d{2}\.json$/.test(f)).sort();
  const ids = new Map<string, string>();
  let total = 0;

  for (const archivo of archivos) {
    const mes = Number(archivo.slice(0, 2));
    const raw = JSON.parse(fs.readFileSync(path.join(dir, archivo), "utf8"));
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      errores++;
      console.error(`✗ ${carpeta}/${archivo}`);
      for (const issue of parsed.error.issues) {
        const idx = issue.path[0];
        const nombre = typeof idx === "number" ? (raw[idx]?.id ?? `#${idx}`) : "";
        console.error(`   [${nombre}] ${issue.path.join(".")}: ${issue.message}`);
      }
      continue;
    }
    for (const c of parsed.data) {
      total++;
      if (c.fecha.mes !== mes) {
        errores++;
        console.error(`✗ ${carpeta}/${archivo} [${c.id}] fecha.mes=${c.fecha.mes} no coincide con el archivo`);
      }
      const previo = ids.get(c.id);
      if (previo) {
        errores++;
        console.error(`✗ ${carpeta}/${archivo} [${c.id}] id duplicado (ya está en ${previo})`);
      }
      ids.set(c.id, archivo);
    }
    console.log(`✓ ${carpeta}/${archivo} (${parsed.data.length} ${etiqueta})`);
  }
  console.log(`${total} ${etiqueta} en ${archivos.length} archivos`);
}

console.log(`${errores} errores`);
process.exit(errores ? 1 : 0);
