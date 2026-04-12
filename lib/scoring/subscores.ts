/**
 * Deterministic sub-score calculators.
 *
 * Each function returns a value in [0, 100].
 * Higher is always better for the creator:
 *   fair_pay    — how well the offered comp matches market rates
 *   brand_risk  — how safe/legitimate the brand appears
 *   fit         — how well the offer matches creator's audience
 *   terms_burden — how creator-friendly the contract terms are
 */

import type { ParsedOffer, BrandSignalRecord } from "@/lib/validation/schemas";
import type { BenchmarkMatch } from "@/lib/data/benchmarks";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value);
}

// ---------------------------------------------------------------------------
// fair_pay  (weight 0.35)
// ---------------------------------------------------------------------------

export interface FairPayInput {
  offeredAmount: number;
  compensationType: string;
  benchmark: { low: number; avg: number; high: number } | null;
}

export interface FairPayResult {
  score: number;
  fairMarketLow: number | null;
  fairMarketHigh: number | null;
  evidenceNote: string | null;
}

/**
 * Piecewise-linear score based on offered / benchmark_avg ratio.
 *
 *  ratio 0.0 →  0   (no pay)
 *  ratio 0.5 → 25   (half average)
 *  ratio 1.0 → 55   (at average — acceptable, not good)
 *  ratio 1.5 → 78   (50 % above average)
 *  ratio 2.0 → 95   (double average)
 *  ratio 2.0+ → 100
 */
function ratioPay(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio <= 0.5) return clamp(ratio * 50); // 0 → 25
  if (ratio <= 1.0) return clamp(25 + (ratio - 0.5) * 60); // 25 → 55
  if (ratio <= 1.5) return clamp(55 + (ratio - 1.0) * 46); // 55 → 78
  if (ratio <= 2.0) return clamp(78 + (ratio - 1.5) * 34); // 78 → 95
  return 100;
}

export function calcFairPay(input: FairPayInput): FairPayResult {
  const { offeredAmount, compensationType, benchmark } = input;

  // Non-cash compensation types — score directly
  if (compensationType === "gifted") {
    return {
      score: 12,
      fairMarketLow: benchmark?.low ?? null,
      fairMarketHigh: benchmark?.high ?? null,
      evidenceNote: "Offer is gifted (no cash) — significantly below any cash benchmark.",
    };
  }
  if (compensationType === "affiliate") {
    return {
      score: 38,
      fairMarketLow: benchmark?.low ?? null,
      fairMarketHigh: benchmark?.high ?? null,
      evidenceNote: "Affiliate commission structure — cash equivalent is uncertain and typically below market.",
    };
  }
  if (compensationType === "revenue_share") {
    return {
      score: 35,
      fairMarketLow: benchmark?.low ?? null,
      fairMarketHigh: benchmark?.high ?? null,
      evidenceNote: "Revenue share structure — cash equivalent is uncertain.",
    };
  }

  // No benchmark available — neutral score
  if (!benchmark || benchmark.avg === 0) {
    return {
      score: 50,
      fairMarketLow: null,
      fairMarketHigh: null,
      evidenceNote: "No benchmark data found for this deliverable/niche combination — rate fairness cannot be assessed.",
    };
  }

  const ratio = offeredAmount / benchmark.avg;
  const score = round(ratioPay(ratio));

  const note =
    offeredAmount < benchmark.low
      ? `Offer ($${offeredAmount}) is below the benchmark minimum ($${benchmark.low}–$${benchmark.high}).`
      : offeredAmount > benchmark.high
      ? `Offer ($${offeredAmount}) exceeds the benchmark maximum — well-compensated.`
      : `Offer ($${offeredAmount}) is within the benchmark range ($${benchmark.low}–$${benchmark.high}).`;

  return {
    score,
    fairMarketLow: benchmark.low,
    fairMarketHigh: benchmark.high,
    evidenceNote: note,
  };
}

// ---------------------------------------------------------------------------
// brand_risk  (weight 0.30)
// ---------------------------------------------------------------------------

export interface BrandRiskResult {
  score: number;
  evidenceNote: string;
}

/**
 * Scores brand legitimacy using review_score (1–5) and legitimacy flags.
 * If no brand signal is found, returns a neutral 50 with a warning.
 */
export function calcBrandRisk(
  brandSignal: BrandSignalRecord | null
): BrandRiskResult {
  if (!brandSignal) {
    return {
      score: 50,
      evidenceNote:
        "No brand signal found — legitimacy cannot be assessed. Research this brand independently.",
    };
  }

  // Base score from review rating (scaled to 0–80)
  const reviewScore = brandSignal.review_score ?? 3.0;
  let base = ((reviewScore - 1) / 4) * 80; // maps 1→0, 5→80

  // Legitimacy flag bonuses/penalties (sum to ±20 points at most)
  const flags = brandSignal.legitimacy_flags;
  if (flags.has_website) base += 4;
  if (flags.has_social) base += 4;
  if (flags.has_reviews) base += 4;
  if (flags.is_verified) base += 8;
  if (flags.known_complaints) base -= 20;

  const score = round(clamp(base));

  const parts: string[] = [];
  if (brandSignal.review_score !== null) {
    parts.push(`review score ${brandSignal.review_score}/5`);
  }
  if (!flags.has_website) parts.push("no verified website");
  if (!flags.has_social) parts.push("no social presence");
  if (flags.known_complaints) parts.push("has creator complaints on record");
  if (flags.is_verified) parts.push("verified brand");

  const note = parts.length > 0 ? `Brand signal: ${parts.join(", ")}.` : "Brand appears legitimate.";

  return { score, evidenceNote: note };
}

// ---------------------------------------------------------------------------
// fit  (weight 0.20)
// ---------------------------------------------------------------------------

export interface FitInput {
  creatorNiche: string;
  creatorPlatform: string;
  followers: number;
  deliverableTypes: string[];
}

export interface FitResult {
  score: number;
  evidenceNote: string;
}

/**
 * Scores content/audience fit deterministically.
 * Base 65 — LLM explanation (step 13) will provide the narrative;
 * this deterministic layer adjusts for platform mismatch and follower tier.
 */
export function calcFit(input: FitInput): FitResult {
  let score = 65; // neutral baseline
  const notes: string[] = [];

  const { creatorPlatform, followers, deliverableTypes } = input;

  // Platform–deliverable alignment
  const tiktokOnly = deliverableTypes.every((t) => t === "tiktok");
  const reelOrStoryOrPost = deliverableTypes.some((t) =>
    ["reel", "story", "post"].includes(t)
  );

  if (creatorPlatform === "instagram" && tiktokOnly) {
    score -= 15;
    notes.push("deliverables are TikTok-only but creator is on Instagram");
  }
  if (creatorPlatform === "tiktok" && reelOrStoryOrPost) {
    score -= 10;
    notes.push("deliverables include Instagram-specific formats for a TikTok creator");
  }

  // Follower range
  if (followers < 10_000) {
    score -= 15;
    notes.push("follower count is below the 10K supported minimum");
  } else if (followers > 150_000) {
    score -= 5;
    notes.push("follower count exceeds typical range for this analysis tier");
  } else {
    notes.push(`follower count (${followers.toLocaleString()}) is within typical brand deal range`);
  }

  return {
    score: round(clamp(score)),
    evidenceNote: notes.join("; "),
  };
}

// ---------------------------------------------------------------------------
// terms_burden  (weight 0.15)
// ---------------------------------------------------------------------------

export interface TermsInput {
  usageRightsScope: string;
  usageRightsDurationMonths: number | undefined;
  isExclusive: boolean;
  exclusivityDurationMonths: number | undefined;
  revisions: number | undefined;
  paymentTiming: string | undefined;
}

export interface TermsResult {
  score: number;
  evidenceNote: string;
}

const USAGE_BASE: Record<string, number> = {
  none: 95,
  organic_only: 82,
  paid_ads: 45,
  whitelisting: 35,
  broad: 20,
};

/**
 * Score how creator-friendly the contract terms are.
 * Higher = better for creator (less burden).
 */
export function calcTermsBurden(input: TermsInput): TermsResult {
  const {
    usageRightsScope,
    usageRightsDurationMonths,
    isExclusive,
    exclusivityDurationMonths,
    revisions,
    paymentTiming,
  } = input;

  let score = USAGE_BASE[usageRightsScope] ?? 50;
  const notes: string[] = [`usage rights: ${usageRightsScope.replace("_", " ")}`];

  // Usage rights duration penalty (beyond 6 months)
  if (
    usageRightsDurationMonths !== undefined &&
    usageRightsDurationMonths > 6 &&
    usageRightsScope !== "none" &&
    usageRightsScope !== "organic_only"
  ) {
    const penaltyMonths = usageRightsDurationMonths - 6;
    score -= Math.min(penaltyMonths * 3, 15);
    notes.push(`${usageRightsDurationMonths}-month usage window`);
  }

  // Exclusivity penalty
  if (isExclusive) {
    score -= 12;
    notes.push("exclusivity requested");
    if (exclusivityDurationMonths !== undefined && exclusivityDurationMonths > 3) {
      score -= Math.min((exclusivityDurationMonths - 3) * 2, 10);
      notes.push(`${exclusivityDurationMonths}-month exclusivity window`);
    }
  }

  // Revision penalty (> 2 rounds is burdensome)
  if (revisions !== undefined && revisions > 2) {
    score -= Math.min((revisions - 2) * 5, 15);
    notes.push(`${revisions} revision rounds`);
  }

  // Payment timing bonus/penalty
  if (paymentTiming === "upfront") {
    score += 10;
    notes.push("payment upfront");
  } else if (paymentTiming === "on_completion") {
    score += 5;
    notes.push("payment on completion");
  } else if (paymentTiming === "net_60") {
    score -= 10;
    notes.push("net-60 payment terms");
  } else if (!paymentTiming || paymentTiming === "unknown") {
    score -= 5;
    notes.push("payment timing not specified");
  }

  return {
    score: round(clamp(score)),
    evidenceNote: notes.join("; "),
  };
}
