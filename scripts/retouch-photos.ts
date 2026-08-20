/**
 * Stage 1 of the retouch: cut the food out of the restaurant's own phone photos.
 *
 *   FAL_KEY=... npx tsx scripts/retouch-photos.ts
 *
 * WHY THIS IS A CUTOUT AND NOT AN IMAGE EDIT
 * ------------------------------------------
 * The first version of this script asked FLUX Kontext to "relight the scene but
 * do not touch the food". It produced beautiful backgrounds and quietly
 * re-rendered the food too — the calzone came back smaller and smoother, the
 * submarine came back rescaled on a plate it was never served on. An
 * instruction-edit model regenerates the whole frame, so subject preservation
 * can never be *guaranteed* by prompt wording.
 *
 * So fal is used here only for what it is actually reliable at: segmenting the
 * subject. The original pixels are then composited onto a synthesised surface
 * by `scripts/compose-photos.py`. The food is byte-identical to what the
 * kitchen served; only what surrounds it changes.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "brand", "client-media", "prepped");
const OUT = join(ROOT, "brand", "client-media", "cutouts");

const MODEL = "fal-ai/birefnet/v2";
const QUEUE = "https://queue.fal.run";
const FAL_KEY = process.env.FAL_KEY;

const JOBS = [
  { name: "calzone", file: "calzone.jpg" },
  { name: "submarine", file: "submarine.jpg" },
  { name: "wings-fries", file: "wings-fries.jpg" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const headers = () => ({ Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" });

async function exists(p: string) {
  try { await access(p); return true; } catch { return false; }
}

async function runModel(input: Record<string, unknown>): Promise<any> {
  const submit = await fetch(`${QUEUE}/${MODEL}`, {
    method: "POST", headers: headers(), body: JSON.stringify(input),
  });
  if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);

  const { request_id } = (await submit.json()) as { request_id: string };
  const base = `${QUEUE}/${MODEL.split("/").slice(0, 2).join("/")}/requests/${request_id}`;
  const deadline = Date.now() + 8 * 60_000;
  let delay = 2000;

  while (Date.now() < deadline) {
    await sleep(delay);
    delay = Math.min(delay * 1.2, 8000);
    const st = await fetch(`${base}/status`, { headers: headers() });
    if (!st.ok) continue;
    const { status } = (await st.json()) as { status: string };
    if (status === "COMPLETED") {
      const r = await fetch(base, { headers: headers() });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }
    if (status === "FAILED") throw new Error("job failed");
    process.stdout.write(".");
  }
  throw new Error("timed out");
}

async function main() {
  if (!FAL_KEY) {
    console.error("\n✗ FAL_KEY is not set. `set -a && source .env.local && set +a` first.\n");
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });
  const force = process.argv.includes("--force");

  let done = 0, failed = 0;
  for (const job of JOBS) {
    const dest = join(OUT, `${job.name}.png`);
    if (!force && (await exists(dest))) { console.log(`- ${job.name} (exists)`); continue; }

    process.stdout.write(`→ ${job.name} `);
    try {
      const b64 = (await readFile(join(SRC, job.file))).toString("base64");
      const result = await runModel({
        image_url: `data:image/jpeg;base64,${b64}`,
        model: "General Use (Heavy)",
        output_format: "png",
        refine_foreground: true,
      });
      const url = result?.image?.url ?? result?.images?.[0]?.url;
      if (!url) throw new Error(`no image: ${JSON.stringify(result).slice(0, 200)}`);
      const res = await fetch(url);
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      console.log(" ✓");
      done++;
    } catch (e) {
      console.log(` ✗ ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }
  console.log(`\n${done} cut out, ${failed} failed → brand/client-media/cutouts/`);
  if (failed) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
