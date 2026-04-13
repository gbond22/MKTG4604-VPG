import type { ParsedOffer, RiskFlag, BrandSignalRecord } from "@/lib/validation/schemas";

/** The possible outcomes from the hard-stop check. */
export type HardStopAction = "FORCE_DECLINE" | "LOW_CONFIDENCE_WARNING" | null;

export interface HardStopResult {
  /** When true the scoring engine must not produce a composite score. */
  triggered: boolean;
  action: HardStopAction;
  riskFlags: RiskFlag[];
}

// ---------------------------------------------------------------------------
// Keyword patterns that escalate brand complaints to a hard stop
// ---------------------------------------------------------------------------
const SCAM_KEYWORDS = [
  "non-payment",
  "unpaid",
  "didn't pay",
  "did not pay",
  "fake",
  "account access",
  "suspicious",
  "scam",
];

function mentionsScam(notes: string | null): boolean {
  if (!notes) return false;
  const lower = notes.toLowerCase();
  return SCAM_KEYWORDS.some((kw) => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// Supported segment constants
// ---------------------------------------------------------------------------
const SUPPORTED_PLATFORMS = ["instagram", "tiktok"] as const;
const SUPPORTED_NICHES = [
  "beauty",
  "fitness",
  "lifestyle",
  "food",
  "consumer",
] as const;

// ---------------------------------------------------------------------------
// Main evaluator
// ---------------------------------------------------------------------------

/**
 * Evaluate every hard-stop rule in priority order.
 * Rules are matched by id; the `condition` strings in scoring-config.json
 * serve as documentation only — the actual logic lives here.
 *
 * Order:
 *   1. SCAM_OVERRIDE   → FORCE_DECLINE (highest priority)
 *   2. EXCESSIVE_RIGHTS → FORCE_DECLINE
 *   3. UNSUPPORTED_SEGMENT → LOW_CONFIDENCE_WARNING (non-blocking)
 */
const FOLLOWER_MIN = 10_000;
const FOLLOWER_MAX = 150_000;

export function evaluateHardStops(
  offer: ParsedOffer,
  brandSignal: BrandSignalRecord | null,
  creatorPlatform: string,
  creatorNiche: string,
  followers: number
): HardStopResult {
  const riskFlags: RiskFlag[] = [];

  // ── 1. SCAM_OVERRIDE ──────────────────────────────────────────────────────
  if (brandSignal) {
    const reviewTooLow =
      brandSignal.review_score !== null && brandSignal.review_score < 2.0;
    const scamComplaints =
      brandSignal.legitimacy_flags.known_complaints && mentionsScam(brandSignal.complaint_notes);

    if (reviewTooLow || scamComplaints) {
      riskFlags.push({
        severity: "critical",
        category: "scam_signal",
        description: reviewTooLow
          ? `Brand review score is ${brandSignal.review_score}/5 — below the 2.0 safety threshold.`
          : `Brand has known complaints involving non-payment or suspicious activity: "${brandSignal.complaint_notes}".`,
      });
      return { triggered: true, action: "FORCE_DECLINE", riskFlags };
    }
  }

  // ── 2. EXCESSIVE_RIGHTS ───────────────────────────────────────────────────
  if (offer.usage_rights) {
    const { scope, duration_months } = offer.usage_rights;
    const broadScope =
      scope === "paid_ads" || scope === "whitelisting" || scope === "broad";
    if (broadScope && duration_months !== undefined && duration_months >= 12) {
      riskFlags.push({
        severity: "critical",
        category: "usage_rights",
        description: `Offer requests ${scope.replace("_", " ")} usage rights for ${duration_months} months with no stated additional compensation — this is an excessive rights ask.`,
      });
      return { triggered: true, action: "FORCE_DECLINE", riskFlags };
    }
  }

  // ── 3. UNSUPPORTED_SEGMENT ────────────────────────────────────────────────
  const unsupportedPlatform = !(SUPPORTED_PLATFORMS as readonly string[]).includes(
    creatorPlatform.toLowerCase()
  );
  const unsupportedNiche = !(SUPPORTED_NICHES as readonly string[]).includes(
    creatorNiche.toLowerCase()
  );
  if (unsupportedPlatform || unsupportedNiche) {
    riskFlags.push({
      severity: "medium",
      category: "other",
      description: `Creator's ${unsupportedPlatform ? "platform" : "niche"} is outside the supported range for this tool. Benchmarks may be inaccurate.`,
    });
    return { triggered: false, action: "LOW_CONFIDENCE_WARNING", riskFlags };
  }

  // ── 4. FOLLOWER_RANGE ─────────────────────────────────────────────────────
  if (followers < FOLLOWER_MIN || followers > FOLLOWER_MAX) {
    riskFlags.push({
      severity: "medium",
      category: "other",
      description: `Follower count is outside the supported benchmark range (10K–150K). Scores may be less accurate.`,
    });
    return { triggered: false, action: "LOW_CONFIDENCE_WARNING", riskFlags };
  }

  return { triggered: false, action: null, riskFlags };
}
