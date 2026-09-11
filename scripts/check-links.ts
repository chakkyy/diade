import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { archivoMesSchema } from "../src/lib/schema";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36";
const CONCURRENCIA = 8;
const TIMEOUT_MS = 20000;

const dir = path.join(process.cwd(), "data", "celebraciones");
const soloMes = process.argv[2];
const archivos = fs
  .readdirSync(dir)
  .filter(
    (f) =>
      /^\d{2}\.json$/.test(f) &&
      (!soloMes || f.startsWith(soloMes.padStart(2, "0"))),
  )
  .sort();

type Tarea = { archivo: string; id: string; url: string };
const tareas: Tarea[] = [];
for (const archivo of archivos) {
  const data = archivoMesSchema.parse(
    JSON.parse(fs.readFileSync(path.join(dir, archivo), "utf8")),
  );
  for (const c of data)
    for (const f of c.fuentes) tareas.push({ archivo, id: c.id, url: f.url });
}

const porUrl = new Map<string, Tarea[]>();
for (const t of tareas) porUrl.set(t.url, [...(porUrl.get(t.url) ?? []), t]);
const urls = [...porUrl.keys()];

async function probar(
  url: string,
  metodo: "HEAD" | "GET",
): Promise<number | string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: metodo,
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: ctrl.signal,
    });
    return res.status;
  } catch (e) {
    return e instanceof Error ? e.name : String(e);
  } finally {
    clearTimeout(timer);
  }
}

function probarConCurl(url: string): number | string {
  try {
    const out = execFileSync(
      "curl",
      ["-sL", "-A", UA, "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "25", url],
      { encoding: "utf8" },
    );
    return Number(out.trim()) || out.trim();
  } catch {
    return "curl-error";
  }
}

async function verificar(url: string): Promise<number | string> {
  const head = await probar(url, "HEAD");
  if (head === 200) return head;
  const get = await probar(url, "GET");
  if (typeof get === "number") return get;
  return probarConCurl(url);
}

const resultados = new Map<string, number | string>();
let cursor = 0;
async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    resultados.set(url, await verificar(url));
  }
}
async function main() {
  await Promise.all(Array.from({ length: CONCURRENCIA }, worker));

  let rotos = 0;
  for (const url of urls) {
    const r = resultados.get(url);
    const ok = r === 200;
    if (!ok) {
      rotos++;
      const quienes = porUrl
        .get(url)!
        .map((t) => `${t.archivo}:${t.id}`)
        .join(", ");
      console.log(`✗ ${r}  ${url}\n     ← ${quienes}`);
    }
  }
  console.log(
    `${urls.length} URLs únicas, ${urls.length - rotos} OK, ${rotos} con problema`,
  );
  process.exit(rotos ? 1 : 0);
}

void main();
