/**
 * Shared fal.ai queue client.
 *
 * Submit → poll → fetch result. Used by every generation script so the retry,
 * timeout and error handling live in exactly one place.
 */
import { writeFile, access } from "node:fs/promises";

const QUEUE = "https://queue.fal.run";

export const FAL_KEY = process.env.FAL_KEY;

export function requireKey(): string {
  if (!FAL_KEY) {
    console.error(
      "\n✗ FAL_KEY is not set.\n  Run:  set -a && source .env.local && set +a\n"
    );
    process.exit(1);
  }
  return FAL_KEY;
}

const headers = () => ({ Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function runModel(
  model: string,
  input: Record<string, unknown>,
  timeoutMinutes = 12
): Promise<any> {
  const submit = await fetch(`${QUEUE}/${model}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);

  const { request_id: requestId } = (await submit.json()) as { request_id: string };
  // Status/result live under the first two path segments of the model id.
  const base = `${QUEUE}/${model.split("/").slice(0, 2).join("/")}/requests/${requestId}`;

  const deadline = Date.now() + timeoutMinutes * 60_000;
  let delay = 2500;

  while (Date.now() < deadline) {
    await sleep(delay);
    delay = Math.min(delay * 1.2, 10_000);

    const st = await fetch(`${base}/status`, { headers: headers() });
    if (!st.ok) continue;

    const { status } = (await st.json()) as { status: string };
    if (status === "COMPLETED") {
      const r = await fetch(base, { headers: headers() });
      if (!r.ok) throw new Error(`result fetch failed: ${await r.text()}`);
      return r.json();
    }
    if (status === "FAILED") throw new Error("fal job failed");
    process.stdout.write(".");
  }
  throw new Error(`timed out after ${timeoutMinutes} minutes`);
}

export async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} for ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}
