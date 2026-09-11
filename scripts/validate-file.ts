import fs from "node:fs";
import { archivoMesSchema } from "../src/lib/schema";

const archivo = process.argv[2];
if (!archivo) {
  console.error("uso: tsx scripts/validate-file.ts <ruta.json>");
  process.exit(2);
}
const raw = JSON.parse(fs.readFileSync(archivo, "utf8"));
const parsed = archivoMesSchema.safeParse(raw);
if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    const idx = issue.path[0];
    const nombre = typeof idx === "number" ? (raw[idx]?.id ?? `#${idx}`) : "";
    console.error(`✗ [${nombre}] ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}
const ids = parsed.data.map((c) => c.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) {
  console.error(`✗ ids duplicados: ${dup.join(", ")}`);
  process.exit(1);
}
console.log(`✓ ${archivo} (${parsed.data.length} celebraciones)`);
