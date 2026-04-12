import { loadFixture } from "./fixture-loader";
import type { BrandSignalRecord } from "@/lib/validation/schemas";

let _cache: BrandSignalRecord[] | null = null;

function getAll(): BrandSignalRecord[] {
  return (_cache ??= loadFixture<BrandSignalRecord[]>("brand-signals.json"));
}

function normalizeUrl(url: string): string {
  return url.toLowerCase().replace(/\/+$/, "").replace(/^https?:\/\//, "");
}

/**
 * Look up a brand signal record by URL (preferred) then name.
 * Returns null if no match is found — caller treats unknown brands as neutral.
 */
export function lookupBrandSignal(
  brandUrl?: string | null,
  brandName?: string | null
): BrandSignalRecord | null {
  const all = getAll();

  if (brandUrl) {
    const needle = normalizeUrl(brandUrl);
    const match = all.find((s) => normalizeUrl(s.brand_url) === needle);
    if (match) return match;
  }

  if (brandName) {
    const needle = brandName.toLowerCase().trim();
    // Exact name match
    const exact = all.find((s) => s.brand_name.toLowerCase().trim() === needle);
    if (exact) return exact;

    // Substring match (handles "Brand Co." ↔ "Brand")
    const fuzzy = all.find(
      (s) =>
        s.brand_name.toLowerCase().includes(needle) ||
        needle.includes(s.brand_name.toLowerCase())
    );
    if (fuzzy) return fuzzy;
  }

  return null;
}
