/**
 * Generate the missing menu photography.
 *
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/generate-menu-photos.ts
 *   npx tsx scripts/generate-menu-photos.ts --force dish-fries.jpg
 *
 * Uses flux-pro v1.1-ultra in `raw` mode. That flag disables the aesthetic
 * post-pass and is the single biggest reason the output reads as a photograph
 * rather than an illustration of a photograph. See scripts/menu-brief.ts for
 * the rest of the anti-AI art direction.
 */
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DISHES, NEGATIVE } from "./menu-brief.js";
import { requireKey, runModel, download, exists } from "./fal.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media");
const MODEL = "fal-ai/flux-pro/v1.1-ultra";

async function main() {
  requireKey();
  await mkdir(OUT, { recursive: true });

  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter((a) => !a.startsWith("--"));

  const queue = DISHES.filter((d) => (only.length ? only.includes(d.file) : true));
  const done: string[] = [];
  const failed: { file: string; error: string }[] = [];

  for (const dish of queue) {
    const dest = join(OUT, dish.file);
    if (!force && (await exists(dest))) {
      console.log(`- ${dish.file} (exists)`);
      continue;
    }

    process.stdout.write(`→ ${dish.file} `);
    try {
      const result = await runModel(MODEL, {
        prompt: dish.prompt,
        negative_prompt: NEGATIVE,
        aspect_ratio: dish.aspect,
        raw: true,
        num_images: 1,
        output_format: "jpeg",
        safety_tolerance: "2",
        enable_safety_checker: true,
      });
      const url = result?.images?.[0]?.url;
      if (!url) throw new Error(`no image: ${JSON.stringify(result).slice(0, 200)}`);
      await download(url, dest);
      console.log(" ✓");
      done.push(dish.file);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(` ✗ ${message}`);
      failed.push({ file: dish.file, error: message });
    }
  }

  console.log(`\n${done.length} generated, ${failed.length} failed → public/media/`);
  for (const f of failed) console.log(`  ✗ ${f.file}: ${f.error}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
