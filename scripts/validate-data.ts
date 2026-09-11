import fs from "node:fs";
import path from "node:path";
import { archivoMesSchema } from "../src/lib/schema";

const dir = path.join(process.cwd(), "data", "celebraciones");
const archivos = fs.readdirSync(dir).filter((f) => /^\d{2}\.json$/.test(f)).sort();
const ids = new Map<string, string>();
let errores = 0;
let total = 0;

for (const archivo of archivos) {
  const mes = Number(archivo.slice(0, 2));
  const raw = JSON.parse(fs.readFileSync(path.join(dir, archivo), "utf8"));
  const parsed = archivoMesSchema.safeParse(raw);
  if (!parsed.success) {
    errores++;
    console.error(`✗ ${archivo}`);
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
      console.error(`✗ ${archivo} [${c.id}] fecha.mes=${c.fecha.mes} no coincide con el archivo`);
    }
    const previo = ids.get(c.id);
    if (previo) {
      errores++;
      console.error(`✗ ${archivo} [${c.id}] id duplicado (ya está en ${previo})`);
    }
    ids.set(c.id, archivo);
  }
  console.log(`✓ ${archivo} (${parsed.data.length} celebraciones)`);
}

console.log(`${total} celebraciones en ${archivos.length} archivos, ${errores} errores`);
process.exit(errores ? 1 : 0);
