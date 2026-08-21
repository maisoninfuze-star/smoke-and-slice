/**
 * Fill in every menu item that still has no photograph.
 *
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/generate-remaining.ts            # everything missing
 *   npx tsx scripts/generate-remaining.ts --limit 12 # one batch
 *   npx tsx scripts/generate-remaining.ts --category pizzas
 *   npx tsx scripts/generate-remaining.ts --list     # dry run
 *
 * Items that already have an image in menu-data.ts are skipped, so this is safe
 * to re-run and will never overwrite the restaurant's own photography.
 */
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MENU } from "../src/data/menu-data.js";
import { buildAutoDishes } from "./menu-brief-auto.js";
import { NEGATIVE } from "./menu-brief.js";
import { requireKey, runModel, download, exists } from "./fal.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media");
const MODEL = "fal-ai/flux-pro/v1.1-ultra";

/** Slugs that already carry a photo in menu-data.ts — never regenerate these. */
function alreadyPhotographed(): Set<string> {
  const s = new Set<string>();
  for (const cat of MENU) {
    for (const item of cat.items) {
      if (item.image) s.add(item.slug);
    }
  }
  // The pizza table assigns its images in a ternary rather than per-item.
  ["toute-garnie", "pollo", "hot-and-spicy", "pepperoni", "vegetarienne"].forEach((x) => s.add(x));
  return s;
}

async function main() {
  const args = process.argv.slice(2);
  const list = args.includes("--list");
  const force = args.includes("--force");
  const limIdx = args.indexOf("--limit");
  const limit = limIdx >= 0 ? Number(args[limIdx + 1]) : Infinity;
  const catIdx = args.indexOf("--category");
  const category = catIdx >= 0 ? args[catIdx + 1] : null;

  let dishes = buildAutoDishes(alreadyPhotographed());
  if (category) dishes = dishes.filter((d) => d.category === category);

  if (list) {
    console.log(`${dishes.length} items still need photography:\n`);
    for (const d of dishes) console.log(`  ${d.category.padEnd(18)} ${d.slug}`);
    return;
  }

  requireKey();
  await mkdir(OUT, { recursive: true });

  let done = 0, skipped = 0;
  const failed: { file: string; error: string }[] = [];

  for (const dish of dishes) {
    if (done >= limit) break;
    const dest = join(OUT, dish.file);
    if (!force && (await exists(dest))) { skipped++; continue; }

    process.stdout.write(`→ ${dish.slug} `);
    try {
      const result = await runModel(MODEL, {
        prompt: dish.prompt,
        negative_prompt: NEGATIVE,
        aspect_ratio: "4:3",
        raw: true,
        num_images: 1,
        output_format: "jpeg",
        safety_tolerance: "2",
        enable_safety_checker: true,
      });
      const url = result?.images?.[0]?.url;
      if (!url) throw new Error("no image returned");
      await download(url, dest);
      console.log(" ✓");
      done++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(` ✗ ${message}`);
      failed.push({ file: dish.file, error: message });
    }
  }

  console.log(`\n${done} generated, ${skipped} already present, ${failed.length} failed`);
  for (const f of failed) console.log(`  ✗ ${f.file}: ${f.error}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
