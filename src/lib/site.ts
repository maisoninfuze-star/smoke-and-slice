/**
 * Resolve the canonical site URL without ever throwing.
 *
 * `new URL()` throws a bare "Invalid URL" TypeError on an empty string or on a
 * bare hostname, and Next.js evaluates metadataBase while collecting page
 * configuration — so one blank environment variable takes the whole build down
 * with an error that names no variable and no file. Vercel sets env vars as
 * empty strings when you save the field blank, and `??` does not catch that
 * because "" is neither null nor undefined.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL   — what you set explicitly
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain
 *   3. VERCEL_URL             — this specific deployment
 *   4. http://localhost:3000  — local development
 *
 * A value missing its scheme gets https:// prepended, which is the common
 * mistake ("mrsmokeetslice.ca" rather than "https://mrsmokeetslice.ca").
 */
const FALLBACK = "http://localhost:3000";

function normalise(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function siteUrl(): string {
  return (
    normalise(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalise(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalise(process.env.VERCEL_URL) ??
    FALLBACK
  );
}

/** metadataBase needs a URL object; this one is guaranteed to construct. */
export function siteUrlObject(): URL {
  return new URL(siteUrl());
}
