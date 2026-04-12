/**
 * Deterministic scoring engine.
 *
 * IMPORTANT: the final numeric score is produced entirely here.
 * The LLM never assigns or influences the composite score.
 *
 * Pipeline:
 *   1. Required-fields gate  → NEED_MORE_INFO if any of the three are missing
 *   2. Hard-stop rules       → FORCE_DECLINE or LOW_CONFIDENCE_WARNING
 *   3. Sub-score calculation → fair_pay, brand_risk, fit, terms_burden
 *   4. Weighted composite    → 1–100
 *   5. Decision mapping      → ACCEPT / NEGOTIATE / DECLINE
 *   6. Negotiation points    → actionable list ordered by priority
 */

import type { ParsedOffer, EvaluationResult, RiskFlag, NegotiationPoint, EvidenceNote, FairMarketRange } from "@/lib/validation/schemas";
import { requiredFieldsGate } from "./required-fields-gate";
import { evaluateHardStops } from "./hard-stops";
import { calcFairPay, calcBrandRisk, calcFit, calcTermsBurden } from "./subscores";
import { sumExpectedCompensation } from "@/lib/data/benchmarks";
import { lookupBrandSignal } from "@/lib/data/brand-signals";
import { getScoringConfig } from "@/lib/data/scoring-config";
import type { CreatorProfile } from "@/app/generated/prisma/client";

// ---------------------------------------------------------------------------
// Engine input
// ---------------------------------------------------------------------------

export interface ScoringInput {
  parsedOffer: ParsedOffer;
  profile: CreatorProfile;
  /** From the raw OfferInput — used for brand signal lookup */
  brandUrl?: string | null;
  brandHandle?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampScore(v: number): number {
  return Math.max(1, Math.min(100, Math.round(v)));
}

function buildNegotiationPoints(
  fairPayScore: number,
  brandRiskScore: number,
  termsScore: number,
  offer: ParsedOffer
): NegotiationPoint[] {
  const points: NegotiationPoint[] = [];

  // ── Pay ────────────────────────────────────────────────────────────────
  if (fairPayScore < 40) {
    points.push({
      priority: "must_have",
      topic: "Compensation is significantly below market rate",
      suggested_ask:
        "Request a rate increase to at least the benchmark minimum for your tier and deliverable type before signing.",
      rationale: `Fair-pay score: ${fairPayScore}/100 — offer is in the bottom tier for this niche.`,
    });
  } else if (fairPayScore < 60) {
    points.push({
      priority: "nice_to_have",
      topic: "Compensation is below market average",
      suggested_ask:
        "Counter with a rate closer to the benchmark average for your audience size.",
      rationale: `Fair-pay score: ${fairPayScore}/100.`,
    });
  }

  // ── Usage rights ───────────────────────────────────────────────────────
  const scope = offer.usage_rights?.scope;
  if (scope === "paid_ads" || scope === "whitelisting") {
    points.push({
      priority: "must_have",
      topic: `Broad usage rights requested (${scope.replace("_", " ")})`,
      suggested_ask:
        "Negotiate down to organic-only usage, or request an additional usage fee (typically 20–50 % of the base rate for paid amplification).",
    });
  } else if (scope === "broad") {
    points.push({
      priority: "must_have",
      topic: "Unrestricted usage rights requested",
      suggested_ask:
        "Request explicit scope limits (organic-only) and a time cap (3–6 months).",
    });
  }

  const durationMonths = offer.usage_rights?.duration_months;
  if (
    durationMonths !== undefined &&
    durationMonths > 6 &&
    scope !== "none" &&
    scope !== "organic_only"
  ) {
    points.push({
      priority: "nice_to_have",
      topic: `Usage rights duration is ${durationMonths} months`,
      suggested_ask: "Negotiate the usage window to 3–6 months maximum.",
    });
  }

  // ── Exclusivity ────────────────────────────────────────────────────────
  if (offer.exclusivity?.is_exclusive) {
    const excDuration = offer.exclusivity.duration_months;
    points.push({
      priority: "must_have",
      topic: "Exclusivity requested",
      suggested_ask: excDuration
        ? `Request an exclusivity fee (15–25 % of deal value) or limit the window to under ${Math.min(excDuration, 3)} months.`
        : "Confirm exclusivity scope and duration, then request compensation for any category lock-out.",
    });
  }

  // ── Payment timing ──────────────────────────────────────────────────────
  const timing = offer.payment_timing;
  if (!timing || timing === "unknown") {
    points.push({
      priority: "must_have",
      topic: "Payment timeline not specified",
      suggested_ask:
        "Clarify payment terms in the contract — request net_30 or a 50 % upfront deposit.",
    });
  } else if (timing === "net_60") {
    points.push({
      priority: "must_have",
      topic: "Net-60 payment terms are unfavourable",
      suggested_ask: "Counter-propose net_30 or request a 25–50 % deposit upon signing.",
    });
  }

  // ── Revisions ─────────────────────────────────────────────────────────
  const revisions = offer.revisions;
  if (revisions !== undefined && revisions > 3) {
    points.push({
      priority: "nice_to_have",
      topic: `${revisions} revision rounds requested`,
      suggested_ask: "Cap revisions at 2 rounds; additional revisions should be billed separately.",
    });
  }

  // ── Brand risk ────────────────────────────────────────────────────────
  if (brandRiskScore < 45) {
    points.push({
      priority: "must_have",
      topic: "Brand legitimacy concerns",
      suggested_ask:
        "Request a written contract, 50 % upfront payment, and verify the brand's business registration before proceeding.",
      rationale: `Brand-risk score: ${brandRiskScore}/100.`,
    });
  }

  // Sort: must_have → nice_to_have → informational
  const order = { must_have: 0, nice_to_have: 1, informational: 2 };
  return points.sort((a, b) => order[a.priority] - order[b.priority]);
}

function buildFitSummary(
  profile: CreatorProfile,
  offer: ParsedOffer,
  fairMarket: { low: number; high: number } | null
): string {
  const niche = profile.niche;
  const platform = profile.platform;
  const followers = profile.followers.toLocaleString();
  const comp = offer.compensation;
  const deliverableList = (offer.deliverables ?? [])
    .map((d) => `${d.quantity}× ${d.type}`)
    .join(", ");

  let summary = `This offer targets your ${platform} ${niche} account (${followers} followers) for ${deliverableList || "unspecified deliverables"}.`;

  if (comp) {
    if (comp.type === "gifted") {
      summary += " The compensation is gifted product only — no cash is offered.";
    } else if (fairMarket) {
      const offered = comp.amount;
      if (offered < fairMarket.low) {
        summary += ` The offered $${offered.toLocaleString()} is below the typical range of $${fairMarket.low.toLocaleString()}–$${fairMarket.high.toLocaleString()} for your tier.`;
      } else if (offered > fairMarket.high) {
        summary += ` The offered $${offered.toLocaleString()} exceeds the typical range of $${fairMarket.low.toLocaleString()}–$${fairMarket.high.toLocaleString()} for your tier — this is a well-compensated deal.`;
      } else {
        summary += ` The offered $${offered.toLocaleString()} falls within the typical range of $${fairMarket.low.toLocaleString()}–$${fairMarket.high.toLocaleString()} for your tier.`;
      }
    }
  }

  return summary;
}

// ---------------------------------------------------------------------------
// Main engine entry point
// ---------------------------------------------------------------------------

export function runScoringEngine(input: ScoringInput): EvaluationResult {
  const { parsedOffer, profile, brandUrl, brandHandle } = input;
  const config = getScoringConfig();
  const allRiskFlags: RiskFlag[] = [];
  const evidenceNotes: EvidenceNote[] = [];
  const missingInfoWarnings: string[] = [];

  // ── 1. Required-fields gate ───────────────────────────────────────────
  const gate = requiredFieldsGate(parsedOffer);
  if (!gate.passed) {
    const missingLabels = gate.missing.map((f) =>
      f === "usage_rights" ? "usage rights" : f
    );
    missingInfoWarnings.push(
      `Missing required field(s): ${missingLabels.join(", ")}. Provide the full offer to get a complete score.`
    );
    for (const m of gate.missing) {
      allRiskFlags.push({
        severity: "medium",
        category: "missing_info",
        description: `The offer does not specify ${m === "usage_rights" ? "usage rights" : m}.`,
      });
    }
    return {
      decision_status: "NEED_MORE_INFO",
      composite_score: null,
      fair_market_range: null,
      subscore_breakdown: null,
      risk_flags: allRiskFlags,
      fit_summary: null,
      negotiation_points: [],
      evidence_notes: evidenceNotes,
      confidence_level: "low",
      missing_info_warnings: missingInfoWarnings,
    };
  }

  // Fields are confirmed non-null from here on
  const compensation = parsedOffer.compensation!;
  const deliverables = parsedOffer.deliverables!;
  const usageRights = parsedOffer.usage_rights!;

  // ── 2. Brand signal lookup ────────────────────────────────────────────
  const brandName = parsedOffer.brand_name ?? null;
  const brandSignal = lookupBrandSignal(brandUrl, brandName ?? brandHandle);

  // ── 3. Hard-stop rules ─────────────────────────────────────────────────
  const hardStop = evaluateHardStops(
    parsedOffer,
    brandSignal,
    profile.platform,
    profile.niche
  );
  allRiskFlags.push(...hardStop.riskFlags);

  const confidenceLevel =
    hardStop.action === "LOW_CONFIDENCE_WARNING" ? "low" : "high";

  if (hardStop.triggered && hardStop.action === "FORCE_DECLINE") {
    return {
      decision_status: "DECLINE",
      composite_score: null,
      fair_market_range: null,
      subscore_breakdown: null,
      risk_flags: allRiskFlags,
      fit_summary: null,
      negotiation_points: [],
      evidence_notes: evidenceNotes,
      confidence_level: "high",
      missing_info_warnings: [],
    };
  }

  // ── 4. Benchmark & brand signal data ─────────────────────────────────
  const expectedComp = sumExpectedCompensation(
    profile.platform,
    profile.niche,
    profile.followers,
    deliverables
  );

  // ── 5. Sub-scores ──────────────────────────────────────────────────────
  const fairPayResult = calcFairPay({
    offeredAmount: compensation.amount,
    compensationType: compensation.type,
    benchmark: expectedComp,
  });

  const brandRiskResult = calcBrandRisk(brandSignal);

  const fitResult = calcFit({
    creatorNiche: profile.niche,
    creatorPlatform: profile.platform,
    followers: profile.followers,
    deliverableTypes: deliverables.map((d) => d.type),
  });

  const termsResult = calcTermsBurden({
    usageRightsScope: usageRights.scope,
    usageRightsDurationMonths: usageRights.duration_months,
    isExclusive: parsedOffer.exclusivity?.is_exclusive ?? false,
    exclusivityDurationMonths: parsedOffer.exclusivity?.duration_months,
    revisions: parsedOffer.revisions,
    paymentTiming: parsedOffer.payment_timing,
  });

  // ── 6. Weighted composite score ─────────────────────────────────────────
  const w = config.weights;
  const composite = clampScore(
    fairPayResult.score * w.fair_pay +
      brandRiskResult.score * w.brand_risk +
      fitResult.score * w.fit +
      termsResult.score * w.terms_burden
  );

  // ── 7. Decision status ─────────────────────────────────────────────────
  const thresholds = config.decision_thresholds;
  let decisionStatus: EvaluationResult["decision_status"] =
    composite >= thresholds.accept_min
      ? "ACCEPT"
      : composite >= thresholds.negotiate_min
      ? "NEGOTIATE"
      : "DECLINE";

  // Brand risk flag from high-risk (but not FORCE_DECLINE level) brands
  if (
    brandSignal &&
    brandSignal.legitimacy_flags.known_complaints &&
    decisionStatus === "ACCEPT"
  ) {
    decisionStatus = "NEGOTIATE";
  }

  // ── 8. Additional risk flags (non-blocking) ────────────────────────────
  if (!brandSignal) {
    allRiskFlags.push({
      severity: "low",
      category: "brand_legitimacy",
      description: "Brand is not in the signal database — research independently.",
    });
  } else if (brandSignal.legitimacy_flags.known_complaints) {
    allRiskFlags.push({
      severity: "high",
      category: "payment_risk",
      description: `Brand has documented creator complaints: "${brandSignal.complaint_notes}".`,
    });
  }

  if (usageRights.scope === "paid_ads" || usageRights.scope === "whitelisting") {
    allRiskFlags.push({
      severity: "medium",
      category: "usage_rights",
      description: `Offer includes ${usageRights.scope.replace("_", " ")} — verify that additional compensation reflects this.`,
    });
  }

  if (parsedOffer.exclusivity?.is_exclusive) {
    allRiskFlags.push({
      severity: "medium",
      category: "exclusivity",
      description: `Exclusivity requested${parsedOffer.exclusivity.duration_months ? ` for ${parsedOffer.exclusivity.duration_months} months` : ""}${parsedOffer.exclusivity.category ? ` in the ${parsedOffer.exclusivity.category} category` : ""}.`,
    });
  }

  // ── 9. Evidence notes ──────────────────────────────────────────────────
  if (fairPayResult.evidenceNote) {
    evidenceNotes.push({ source: "benchmark", note: fairPayResult.evidenceNote });
  }
  evidenceNotes.push({ source: "brand_signal", note: brandRiskResult.evidenceNote });
  if (fitResult.evidenceNote) {
    evidenceNotes.push({ source: "profile", note: fitResult.evidenceNote });
  }
  if (termsResult.evidenceNote) {
    evidenceNotes.push({ source: "offer", note: termsResult.evidenceNote });
  }

  // ── 10. Fair market range ─────────────────────────────────────────────
  let fairMarketRange: FairMarketRange | null = null;
  if (fairPayResult.fairMarketLow !== null && fairPayResult.fairMarketHigh !== null) {
    fairMarketRange = {
      low: fairPayResult.fairMarketLow,
      high: fairPayResult.fairMarketHigh,
      currency: compensation.currency,
      basis: "benchmark data for your tier, niche, and deliverable type",
    };
  }

  // ── 11. Negotiation points ─────────────────────────────────────────────
  const negotiationPoints = buildNegotiationPoints(
    fairPayResult.score,
    brandRiskResult.score,
    termsResult.score,
    parsedOffer
  );

  // ── 12. Fit summary ────────────────────────────────────────────────────
  const fitSummary = buildFitSummary(profile, parsedOffer, fairMarketRange);

  if (confidenceLevel === "low") {
    missingInfoWarnings.push(
      "Confidence is low because the creator's platform or niche is outside the standard supported range."
    );
  }

  return {
    decision_status: decisionStatus,
    composite_score: composite,
    fair_market_range: fairMarketRange,
    subscore_breakdown: {
      fair_pay: fairPayResult.score,
      brand_risk: brandRiskResult.score,
      fit: fitResult.score,
      terms_burden: termsResult.score,
    },
    risk_flags: allRiskFlags,
    fit_summary: fitSummary,
    negotiation_points: negotiationPoints,
    evidence_notes: evidenceNotes,
    confidence_level: confidenceLevel,
    missing_info_warnings: missingInfoWarnings,
  };
}
