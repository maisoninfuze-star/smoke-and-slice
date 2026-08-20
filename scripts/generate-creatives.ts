/**
 * Generate the site's photography and hero video with fal.ai.
 *
 *   FAL_KEY=... npm run creatives              # everything that's missing
 *   FAL_KEY=... npm run creatives -- --force   # regenerate everything
 *   FAL_KEY=... npm run creatives -- wings.jpg # just one asset
 *
 * Images: fal-ai/flux-pro/v1.1-ultra in raw mode — the "raw" flag is the single
 * biggest lever for photographic realism; it disables the aesthetic post-pass
 * that gives Flux output its recognisable glossy look.
 *
 * Video: fal-ai/kling-video/v1.6/pro/image-to-video, seeded from the generated
 * hero still so the motion matches the poster frame exactly.
 */
import { writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ASSETS, NEGATIVE_PROMPT, type Asset } from "./creative-brief.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "media");

const IMAGE_MODEL = "fal-ai/flux-pro/v1.1-ultra";
const VIDEO_MODEL = "fal-ai/kling-video/v1.6/pro/image-to-video";
const QUEUE = "https://queue.fal.run";

const FAL_KEY = process.env.FAL_KEY;

function headers() {
  return { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Submit to the fal queue and poll until the result is ready. */
async function runModel(model: string, input: Record<string, unknown>): Promise<any> {
  const submit = await fetch(`${QUEUE}/${model}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  });

  if (!submit.ok) {
    throw new Error(`fal submit failed (${submit.status}): ${await submit.text()}`);
  }

  const { request_id: requestId } = (await submit.json()) as { request_id: string };
  const base = `${QUEUE}/${model.split("/").slice(0, 2).join("/")}/requests/${requestId}`;

  const deadline = Date.now() + 12 * 60_000;
  let delay = 2500;

  while (Date.now() < deadline) {
    await sleep(delay);
    delay = Math.min(delay * 1.2, 10_000);

    const statusRes = await fetch(`${base}/status`, { headers: headers() });
    if (!statusRes.ok) continue;

    const status = (await statusRes.json()) as { status: string };
    if (status.status === "COMPLETED") {
      const result = await fetch(base, { headers: headers() });
      if (!result.ok) throw new Error(`fal result fetch failed: ${await result.text()}`);
      return result.json();
    }
    if (status.status === "FAILED") {
      throw new Error(`fal job failed: ${JSON.stringify(status)}`);
    }
    process.stdout.write(".");
  }

  throw new Error("fal job timed out after 12 minutes");
}

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (${res.status}) for ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function generateImage(asset: Asset) {
  const result = await runModel(IMAGE_MODEL, {
    prompt: asset.prompt,
    negative_prompt: NEGATIVE_PROMPT,
    aspect_ratio: asset.aspect,
    // raw = skip the aesthetic post-pass. This is what keeps it from looking AI.
    raw: true,
    num_images: 1,
    output_format: "jpeg",
    safety_tolerance: "2",
    enable_safety_checker: true,
  });

  const url = result?.images?.[0]?.url;
  if (!url) throw new Error(`no image returned: ${JSON.stringify(result).slice(0, 300)}`);

  await download(url, join(OUT_DIR, asset.file));
  return url;
}

async function generateVideo(asset: Asset) {
  if (!asset.seedFrom) throw new Error(`${asset.file} has no seedFrom still`);

  const seedPath = join(OUT_DIR, asset.seedFrom);
  if (!(await exists(seedPath))) {
    throw new Error(`seed still ${asset.seedFrom} not generated yet — run images first`);
  }

  // fal accepts a data URI for the conditioning image, so no upload step needed.
  const { readFile } = await import("node:fs/promises");
  const b64 = (await readFile(seedPath)).toString("base64");

  const result = await runModel(VIDEO_MODEL, {
    prompt: `${asset.prompt} Camera motion: ${asset.motion}.`,
    negative_prompt: NEGATIVE_PROMPT,
    image_url: `data:image/jpeg;base64,${b64}`,
    duration: "5",
    aspect_ratio: asset.aspect,
    cfg_scale: 0.5,
  });

  const url = result?.video?.url;
  if (!url) throw new Error(`no video returned: ${JSON.stringify(result).slice(0, 300)}`);

  await download(url, join(OUT_DIR, asset.file));
  return url;
}

async function main() {
  if (!FAL_KEY) {
    console.error(
      "\n✗ FAL_KEY is not set.\n\n" +
        "  Add it to .env.local:  FAL_KEY=\"your-key\"\n" +
        "  then run:              set -a && source .env.local && set +a && npm run creatives\n"
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter((a) => !a.startsWith("--"));

  // Images first — the video is seeded from one of them.
  const queue = ASSETS.filter((a) => (only.length ? only.includes(a.file) : true)).sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === "image" ? -1 : 1
  );

  const done: string[] = [];
  const skipped: string[] = [];
  const failed: { file: string; error: string }[] = [];

  for (const asset of queue) {
    const dest = join(OUT_DIR, asset.file);
    if (!force && (await exists(dest))) {
      skipped.push(asset.file);
      console.log(`- ${asset.file} (already exists, use --force to redo)`);
      continue;
    }

    process.stdout.write(`→ ${asset.file} `);
    try {
      if (asset.kind === "image") await generateImage(asset);
      else await generateVideo(asset);
      console.log(" ✓");
      done.push(asset.file);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(` ✗ ${message}`);
      failed.push({ file: asset.file, error: message });
    }
  }

  console.log(
    `\n${done.length} generated, ${skipped.length} skipped, ${failed.length} failed → public/media/`
  );
  if (failed.length) {
    for (const f of failed) console.log(`  ✗ ${f.file}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
