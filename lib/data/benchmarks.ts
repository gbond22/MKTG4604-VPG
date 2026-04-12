import { loadFixture } from "./fixture-loader";
import type { BenchmarkRecord } from "@/lib/validation/schemas";

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Map creator profile niche to fixture niche key. */
function toFixtureNiche(niche: string): string {
  return niche === "consumer" ? "consumer_products" : niche;
}

/**
 * Map ParsedOffer deliverable type to the fixture deliverable name.
 * Returns null when there is no comparable benchmark entry.
 */
function toFixtureDeliverable(type: string): string | null {
  const map: Record<string, string> = {
    reel: "Reel",
    post: "Post",
    story: "Story",
    video: "Video",
    tiktok: "Video",
    ugc: "Video",
    bundle: "Bundle",
    livestream: "Video",
  };
  return map[type.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

let _cache: BenchmarkRecord[] | null = null;

function getAll(): BenchmarkRecord[] {
  return (_cache ??= loadFixture<BenchmarkRecord[]>("benchmarks.json"));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface BenchmarkMatch {
  min_rate: number;
  max_rate: number;
  avg_rate: number;
  source: string;
}

/**
 * Find the benchmark row for a single deliverable type.
 * Falls back to the highest-follower tier when the creator's count
 * exceeds all available ranges.
 */
export function lookupBenchmark(
  platform: string,
  niche: string,
  followers: number,
  deliverableType: string
): BenchmarkMatch | null {
  const fixturePlatform = platform === "instagram" ? "Instagram" : "TikTok";
  const fixtureNiche = toFixtureNiche(niche);
  const fixtureDeliverable = toFixtureDeliverable(deliverableType);

  if (!fixtureDeliverable) return null;

  const all = getAll();

  // Exact tier match
  const exact = all.find(
    (b) =>
      b.platform === fixturePlatform &&
      b.niche === fixtureNiche &&
      b.deliverable === fixtureDeliverable &&
      b.follower_range_min <= followers &&
      b.follower_range_max >= followers
  );
  if (exact) {
    return {
      min_rate: exact.min_rate,
      max_rate: exact.max_rate,
      avg_rate: exact.avg_rate,
      source: exact.source,
    };
  }

  // Follower count above all ranges — use the highest tier available
  const candidates = all.filter(
    (b) =>
      b.platform === fixturePlatform &&
      b.niche === fixtureNiche &&
      b.deliverable === fixtureDeliverable
  );
  if (candidates.length === 0) return null;

  const top = candidates.reduce((a, b) =>
    b.follower_range_max > a.follower_range_max ? b : a
  );
  return {
    min_rate: top.min_rate,
    max_rate: top.max_rate,
    avg_rate: top.avg_rate,
    source: top.source,
  };
}

/**
 * Sum expected compensation across all deliverables in the offer.
 * Returns null when no benchmarks are found for any deliverable.
 */
export function sumExpectedCompensation(
  platform: string,
  niche: string,
  followers: number,
  deliverables: Array<{ type: string; quantity: number }>
): { low: number; avg: number; high: number; sources: string[] } | null {
  let totalLow = 0;
  let totalAvg = 0;
  let totalHigh = 0;
  const sources: string[] = [];
  let found = false;

  for (const d of deliverables) {
    const b = lookupBenchmark(platform, niche, followers, d.type);
    if (b) {
      found = true;
      totalLow += b.min_rate * d.quantity;
      totalAvg += b.avg_rate * d.quantity;
      totalHigh += b.max_rate * d.quantity;
      if (!sources.includes(b.source)) sources.push(b.source);
    }
  }

  return found ? { low: totalLow, avg: totalAvg, high: totalHigh, sources } : null;
}
