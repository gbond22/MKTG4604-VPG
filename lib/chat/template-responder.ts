/**
 * Template-based follow-up responder.
 *
 * Matches the user's question against a priority-ordered set of patterns,
 * then generates a response from the stored EvaluationResult.
 *
 * Step 12 replaces this with an Ollama prompt that receives the same context
 * and the user's question — the interface stays identical.
 */

import type {
  RiskFlag,
  NegotiationPoint,
  EvidenceNote,
  FairMarketRange,
  SubscoreBreakdown,
} from "@/lib/validation/schemas";

// ---------------------------------------------------------------------------
// Evaluation context loaded from the DB
// ---------------------------------------------------------------------------

export interface StoredEvaluationContext {
  decision_status: string;
  composite_score: number | null;
  confidence_level: string;
  subscore_breakdown: SubscoreBreakdown | null;
  risk_flags: RiskFlag[];
  negotiation_points: NegotiationPoint[];
  evidence_notes: EvidenceNote[];
  fair_market_range: FairMarketRange | null;
  fit_summary: string | null;
  missing_info_warnings: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function noteFor(notes: EvidenceNote[], source: EvidenceNote["source"]): string | null {
  return notes.find((n) => n.source === source)?.note ?? null;
}

function scoreLabel(score: number): string {
  if (score >= 80) return "strong";
  if (score >= 65) return "good";
  if (score >= 50) return "moderate";
  if (score >= 40) return "below average";
  return "low";
}

function fmtScore(score: number): string {
  return `${score}/100 (${scoreLabel(score)})`;
}

// ---------------------------------------------------------------------------
// Pattern matchers
// ---------------------------------------------------------------------------

type Matcher = (q: string) => boolean;

const isFairPay: Matcher = (q) =>
  /fair.?pay|pay.?score|compensation.?(score|low|high|why)|why.*(pay|paid|comp)|low.*pay|pay.*low/.test(q) ||
  (q.includes("pay") && (q.includes("score") || q.includes("low") || q.includes("why")));

const isBrandRisk: Matcher = (q) =>
  /brand.?(risk|score|legit|safe|trust|real)|risk.*brand|is.*(brand|company).*legit|scam|legitimate|trust/.test(q);

const isFit: Matcher = (q) =>
  /\bfit\b.*(score|why|low|high|explain)|fit.?score|audience.?fit|niche.?fit|platform.?fit|why.*fit/.test(q);

const isTerms: Matcher = (q) =>
  /terms.?(score|burden|low|why|explain)|contract.*terms|usage.?rights|exclusiv|revision|payment.?timing|net.?60|net.?30/.test(q);

const isWhatIf: Matcher = (q) =>
  /what.?if|if they (offer|pay|increase|raise|bump)|hypothetical|\$\s*[\d,]+/.test(q) &&
  /\$?\s*[\d,]{3,}/.test(q);

const isNegotiate: Matcher = (q) =>
  /negotiate|ask for|counter.?(offer|propose)?|should i ask|what.*ask|how.*counter|negotiat|push back/.test(q);

const isOverall: Matcher = (q) =>
  /should i (accept|take|sign|decline|pass)|is this (a )?(good|bad|worth|fair)|overall|verdict|recommend|what do you think|take this deal/.test(q);

const isScoreExplanation: Matcher = (q) =>
  /how.*(calculat|scor|work|determin)|explain.*(score|composite|number)|composite|weighted|breakdown|how.*score/.test(q);

const isRiskFlags: Matcher = (q) =>
  /risk.?flag|red.?flag|concern|warning|danger|issues|problems|watch out/.test(q);

const isMarketRate: Matcher = (q) =>
  /market.?rate|benchmark|industry.*standard|going rate|typical.*rate|average.*rate|rate.*typical|what.*rate/.test(q);

// ---------------------------------------------------------------------------
// Response builders
// ---------------------------------------------------------------------------

function buildFairPayResponse(ctx: StoredEvaluationContext): string {
  const score = ctx.subscore_breakdown?.fair_pay;
  if (score === undefined || score === null) {
    return "Fair-pay data isn't available for this evaluation — the offer may be missing compensation details.";
  }

  const note = noteFor(ctx.evidence_notes, "benchmark");
  const range = ctx.fair_market_range;

  let response = `**Fair Pay score: ${fmtScore(score)}**\n\n`;

  if (note) response += `${note}\n\n`;

  if (range) {
    response += `The benchmark for your tier and deliverable type is **$${range.low.toLocaleString()}–$${range.high.toLocaleString()} ${range.currency}**.`;
    if (range.basis) response += ` (${range.basis})`;
    response += "\n\n";
  }

  if (score < 40) {
    response +=
      "The offered amount is significantly below market rate — this is the highest-priority item to negotiate. Request a rate increase before signing.";
  } else if (score < 60) {
    response +=
      "The offered amount is below the market average. Consider countering with a figure closer to the benchmark midpoint.";
  } else if (score < 80) {
    response +=
      "The offered amount is within or near the market range — fair, though there may be room to push slightly higher.";
  } else {
    response +=
      "The offered amount is well above average for your tier and deliverable mix — a strong compensation package.";
  }

  return response;
}

function buildBrandRiskResponse(ctx: StoredEvaluationContext): string {
  const score = ctx.subscore_breakdown?.brand_risk;
  if (score === undefined || score === null) {
    return "Brand-risk data isn't available for this evaluation.";
  }

  const note = noteFor(ctx.evidence_notes, "brand_signal");
  const criticalFlags = ctx.risk_flags.filter(
    (f) => f.category === "scam_signal" || f.category === "payment_risk"
  );

  let response = `**Brand Risk score: ${fmtScore(score)}**\n\n`;

  if (note) response += `${note}\n\n`;

  if (criticalFlags.length > 0) {
    response += "**Flags:**\n";
    for (const f of criticalFlags) {
      response += `- ${f.description}\n`;
    }
    response += "\n";
  }

  if (score < 45) {
    response +=
      "Significant legitimacy concerns detected. Before proceeding: request a written contract, a 50% upfront deposit, and verify the brand's business registration.";
  } else if (score < 65) {
    response +=
      "Moderate confidence in this brand. Standard precautions apply — use a written contract and confirm payment terms before delivering content.";
  } else {
    response +=
      "Brand appears reasonably legitimate based on available signals. Proceed with the usual contract and payment practices.";
  }

  return response;
}

function buildFitResponse(ctx: StoredEvaluationContext): string {
  const score = ctx.subscore_breakdown?.fit;
  if (score === undefined || score === null) {
    return "Fit data isn't available for this evaluation.";
  }

  const note = noteFor(ctx.evidence_notes, "profile");
  let response = `**Fit score: ${fmtScore(score)}**\n\n`;

  if (ctx.fit_summary) response += `${ctx.fit_summary}\n\n`;
  if (note) response += `${note}\n\n`;

  if (score < 50) {
    response +=
      "The offer has notable mismatches with your profile — platform, deliverable formats, or follower tier may be outside the typical range this brand targets.";
  } else if (score < 70) {
    response +=
      "Moderate fit. The offer is broadly compatible with your profile but there are some friction points worth discussing with the brand.";
  } else {
    response +=
      "Good alignment between the offer's deliverables and your platform, niche, and audience tier.";
  }

  return response;
}

function buildTermsResponse(ctx: StoredEvaluationContext): string {
  const score = ctx.subscore_breakdown?.terms_burden;
  if (score === undefined || score === null) {
    return "Terms data isn't available for this evaluation.";
  }

  const note = noteFor(ctx.evidence_notes, "offer");
  const termsFlags = ctx.risk_flags.filter(
    (f) => f.category === "usage_rights" || f.category === "exclusivity"
  );

  let response = `**Terms Burden score: ${fmtScore(score)}** — higher is more creator-friendly.\n\n`;

  if (note) response += `${note}\n\n`;

  if (termsFlags.length > 0) {
    response += "**Term-related flags:**\n";
    for (const f of termsFlags) {
      response += `- ${f.description}\n`;
    }
    response += "\n";
  }

  if (score < 45) {
    response +=
      "These terms are heavily skewed toward the brand. Focus your negotiation on narrowing usage rights scope and duration, and cap any exclusivity period.";
  } else if (score < 65) {
    response +=
      "Terms are moderately burdensome. Review the usage rights duration and any exclusivity clause — these are the most common areas for compromise.";
  } else {
    response +=
      "Contract terms are relatively creator-friendly for this type of deal.";
  }

  return response;
}

function buildWhatIfResponse(
  ctx: StoredEvaluationContext,
  newAmount: number
): string {
  const range = ctx.fair_market_range;

  if (!range) {
    return `If the offer were raised to $${newAmount.toLocaleString()}, I can't compare it to a benchmark because no market data was found for your specific tier and deliverable mix. Evaluate it on an absolute basis and against competing offers.`;
  }

  const mid = (range.low + range.high) / 2;
  let position: string;
  if (newAmount < range.low) {
    position = `still below the benchmark minimum of $${range.low.toLocaleString()} — the offer would remain underpaid`;
  } else if (newAmount <= range.high) {
    const pct = Math.round(((newAmount - range.low) / (range.high - range.low)) * 100);
    position = `within the benchmark range of $${range.low.toLocaleString()}–$${range.high.toLocaleString()} (${pct}% of the way through the range)`;
  } else {
    position = `above the benchmark ceiling of $${range.high.toLocaleString()} — a well-compensated deal`;
  }

  const currentScore = ctx.subscore_breakdown?.fair_pay ?? null;
  const currentAmount = (() => {
    // Back out the current offered amount from the evidence note if possible
    const note = noteFor(ctx.evidence_notes, "benchmark");
    const m = note?.match(/Offer \(\$([0-9,]+)\)/);
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
  })();

  let response = `If the offer were raised to **$${newAmount.toLocaleString()}**, it would be ${position}.`;

  if (currentAmount !== null && currentScore !== null) {
    const direction = newAmount > currentAmount ? "improvement" : "reduction";
    response += `\n\nFor context, the current offer of $${currentAmount.toLocaleString()} yields a fair-pay score of ${currentScore}/100. At $${newAmount.toLocaleString()}, relative to the $${Math.round(mid).toLocaleString()} benchmark average, the score would ${newAmount > currentAmount ? "increase" : "decrease"} — an ${direction} in your position.`;
  }

  response += `\n\nThe benchmark range basis: ${range.basis ?? "market data for your tier and deliverable type"}.`;

  return response;
}

function buildNegotiationResponse(ctx: StoredEvaluationContext): string {
  if (ctx.negotiation_points.length === 0) {
    return "No specific negotiation points were flagged for this evaluation — the offer terms appear reasonably creator-friendly across the board.";
  }

  const mustHaves = ctx.negotiation_points.filter((p) => p.priority === "must_have");
  const niceToHaves = ctx.negotiation_points.filter((p) => p.priority === "nice_to_have");

  let response = "Here are the prioritised negotiation points for this offer:\n\n";

  if (mustHaves.length > 0) {
    response += "**Must-haves (negotiate before signing):**\n";
    for (const p of mustHaves) {
      response += `- **${p.topic}**\n  → ${p.suggested_ask}\n`;
      if (p.rationale) response += `  _(${p.rationale})_\n`;
    }
    response += "\n";
  }

  if (niceToHaves.length > 0) {
    response += "**Nice-to-haves (push for if possible):**\n";
    for (const p of niceToHaves) {
      response += `- **${p.topic}**\n  → ${p.suggested_ask}\n`;
    }
    response += "\n";
  }

  response +=
    "Tackle must-haves first — if the brand won't budge on any of them, that changes the overall calculus.";

  return response;
}

function buildOverallResponse(ctx: StoredEvaluationContext): string {
  const status = ctx.decision_status;
  const score = ctx.composite_score;

  const scoreStr = score !== null ? ` (composite score: ${score}/100)` : "";

  let verdict: string;
  if (status === "ACCEPT") {
    verdict = `This offer scores **ACCEPT**${scoreStr}. It clears all hard-stop checks and scores well across compensation, brand legitimacy, fit, and contract terms.`;
  } else if (status === "NEGOTIATE") {
    verdict = `This offer scores **NEGOTIATE**${scoreStr}. It has merit but specific terms need addressing before you sign.`;
  } else if (status === "DECLINE") {
    verdict = `This offer scores **DECLINE**${scoreStr}. One or more dimensions score poorly enough that accepting as-is is not recommended.`;
  } else {
    verdict = "This offer is missing required fields — a full score cannot be calculated until compensation, deliverables, and usage rights are all specified.";
  }

  let response = `${verdict}\n\n`;

  if (ctx.negotiation_points.length > 0 && status !== "DECLINE") {
    const topPoint = ctx.negotiation_points[0];
    response += `**Top priority if you negotiate:** ${topPoint.topic}\n→ ${topPoint.suggested_ask}\n\n`;
  }

  const criticalFlags = ctx.risk_flags.filter((f) => f.severity === "critical");
  if (criticalFlags.length > 0) {
    response += `**Critical flags raised:**\n`;
    for (const f of criticalFlags) response += `- ${f.description}\n`;
    response += "\n";
  }

  if (ctx.confidence_level === "low") {
    response +=
      "_Note: confidence is low — this creator's platform or niche is outside the fully-supported range, so benchmarks may be less accurate._";
  }

  return response;
}

function buildScoreExplanationResponse(ctx: StoredEvaluationContext): string {
  const s = ctx.subscore_breakdown;
  if (!s) {
    return "A composite score could not be calculated for this evaluation — required fields (compensation, deliverables, or usage rights) were missing.";
  }

  const score = ctx.composite_score;

  let response = `**How the composite score is calculated:**\n\n`;
  response += `The score is a weighted average of four sub-scores:\n\n`;
  response += `| Sub-score | Weight | Your score |\n`;
  response += `|-----------|--------|------------|\n`;
  response += `| Fair Pay | 35% | ${s.fair_pay}/100 |\n`;
  response += `| Brand Risk | 30% | ${s.brand_risk}/100 |\n`;
  response += `| Fit | 20% | ${s.fit}/100 |\n`;
  response += `| Terms Burden | 15% | ${s.terms_burden}/100 |\n\n`;

  if (score !== null) {
    const computed =
      s.fair_pay * 0.35 + s.brand_risk * 0.3 + s.fit * 0.2 + s.terms_burden * 0.15;
    response += `**Weighted result: ${Math.round(computed)}/100 → composite score: ${score}/100**\n\n`;
  }

  response +=
    "Decision thresholds: ≥75 → ACCEPT · 50–74 → NEGOTIATE · <50 → DECLINE\n\n";
  response +=
    "The LLM never influences these numbers — all scores are computed deterministically from benchmark data and offer terms.";

  return response;
}

function buildRiskFlagsResponse(ctx: StoredEvaluationContext): string {
  if (ctx.risk_flags.length === 0) {
    return "No risk flags were raised for this evaluation — the offer cleared all standard checks.";
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...ctx.risk_flags].sort(
    (a, b) => order[a.severity] - order[b.severity]
  );

  const severityEmoji: Record<string, string> = {
    critical: "[CRITICAL]",
    high: "[HIGH]",
    medium: "[MEDIUM]",
    low: "[LOW]",
  };

  let response = `**Risk flags (${sorted.length} total):**\n\n`;
  for (const f of sorted) {
    response += `${severityEmoji[f.severity] ?? ""} **${f.category.replace("_", " ")}** — ${f.description}\n\n`;
  }

  const critical = sorted.filter((f) => f.severity === "critical");
  if (critical.length > 0) {
    response +=
      "Critical flags indicate this deal should be declined or requires significant due diligence before proceeding.";
  } else if (sorted.some((f) => f.severity === "high")) {
    response +=
      "High-severity flags warrant caution — address these in negotiation before signing.";
  }

  return response;
}

function buildMarketRateResponse(ctx: StoredEvaluationContext): string {
  const range = ctx.fair_market_range;
  const note = noteFor(ctx.evidence_notes, "benchmark");

  if (!range) {
    return (
      "No benchmark data was found for your specific platform, niche, and deliverable combination. " +
      (note ?? "Evaluate the rate based on your own prior deals and direct comparisons with peers.")
    );
  }

  let response = `**Fair market range for your tier and deliverable type:**\n`;
  response += `$${range.low.toLocaleString()} – $${range.high.toLocaleString()} ${range.currency}\n\n`;

  if (range.basis) response += `Basis: ${range.basis}\n\n`;
  if (note) response += `${note}\n\n`;

  const mid = Math.round((range.low + range.high) / 2);
  response += `The benchmark midpoint is **$${mid.toLocaleString()}**. Offers at or above this figure are considered fairly compensated for your tier.`;

  return response;
}

function buildFallbackResponse(ctx: StoredEvaluationContext): string {
  const score = ctx.composite_score;
  const status = ctx.decision_status;

  let response = `I can answer specific questions about this evaluation`;
  if (score !== null) response += ` (score: ${score}/100, ${status})`;
  response += `. Try asking about:\n\n`;
  response += `- **The composite score** — "How was my score calculated?"\n`;
  response += `- **A specific sub-score** — "Why is my fair pay score low?" / "Explain the brand risk score"\n`;
  response += `- **Negotiation advice** — "What should I ask for?" / "What are the must-haves?"\n`;
  response += `- **Risk flags** — "What are the red flags?"\n`;
  response += `- **Market rate** — "What is the benchmark rate for this deal?"\n`;
  response += `- **Hypothetical** — "What if they raised the offer to $1,500?"\n`;
  response += `- **Overall verdict** — "Should I accept this offer?"`;

  return response;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Generate a template-based response for a follow-up question.
 * Returns plain text / markdown suitable for rendering in the chat UI.
 */
export function generateTemplateResponse(
  question: string,
  ctx: StoredEvaluationContext
): string {
  const q = question.toLowerCase();

  if (isFairPay(q)) return buildFairPayResponse(ctx);
  if (isBrandRisk(q)) return buildBrandRiskResponse(ctx);
  if (isFit(q)) return buildFitResponse(ctx);
  if (isTerms(q)) return buildTermsResponse(ctx);
  if (isWhatIf(q)) {
    const m = q.match(/\$?\s*([\d,]+)/);
    const amount = m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
    if (amount > 0) return buildWhatIfResponse(ctx, amount);
  }
  if (isNegotiate(q)) return buildNegotiationResponse(ctx);
  if (isOverall(q)) return buildOverallResponse(ctx);
  if (isScoreExplanation(q)) return buildScoreExplanationResponse(ctx);
  if (isRiskFlags(q)) return buildRiskFlagsResponse(ctx);
  if (isMarketRate(q)) return buildMarketRateResponse(ctx);

  return buildFallbackResponse(ctx);
}
