import { NextRequest, NextResponse } from "next/server";
import { EvaluateRequestSchema } from "@/lib/validation/schemas";
import { getProfileById } from "@/lib/db/profile";
import { prisma } from "@/lib/prisma";
import { parseOfferWithTrace } from "@/lib/ollama/parser";
import { runScoringEngine } from "@/lib/scoring/engine";
import { logEvaluation } from "@/lib/trace/logger";

/**
 * POST /api/evaluate
 *
 * Pipeline:
 *   1. Validate request body
 *   2. Load creator profile
 *   3. Persist raw offer
 *   4. Parse offer text → ParsedOffer (Ollama LLM; mock fallback if unreachable)
 *   5. Run deterministic scoring engine → EvaluationResult
 *   6. Persist evaluation
 *   7. Return { evaluation_id, result }
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = EvaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { profile_id, offer } = parsed.data;

  // ── 1. Load creator profile ───────────────────────────────────────────────
  const profile = await getProfileById(profile_id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // ── 2. Persist raw offer ──────────────────────────────────────────────────
  let savedOffer;
  try {
    savedOffer = await prisma.brandOffer.create({
      data: {
        raw_offer_text: offer.raw_offer_text,
        brand_url: offer.brand_url ?? null,
        brand_handle: offer.brand_handle ?? null,
      },
    });
  } catch (err) {
    console.error("[/api/evaluate POST] offer save failed", err);
    return NextResponse.json({ error: "Failed to save offer" }, { status: 500 });
  }

  // ── 3. Parse offer → ParsedOffer ──────────────────────────────────────────
  const parseResult = await parseOfferWithTrace(
    offer.raw_offer_text,
    offer.brand_handle
  );
  const parsedOffer = parseResult.parsed_offer;

  // ── 4. Run deterministic scoring engine ───────────────────────────────────
  const result = runScoringEngine({
    parsedOffer,
    profile,
    brandUrl: offer.brand_url ?? null,
    brandHandle: offer.brand_handle ?? null,
  });

  // ── 5. Persist evaluation ─────────────────────────────────────────────────
  let savedEvaluation;
  try {
    savedEvaluation = await prisma.evaluation.create({
      data: {
        offer_id: savedOffer.id,
        profile_id: profile.id,
        decision_status: result.decision_status,
        composite_score: result.composite_score,
        confidence_level: result.confidence_level,
        subscore_breakdown: result.subscore_breakdown
          ? JSON.stringify(result.subscore_breakdown)
          : null,
        risk_flags: JSON.stringify(result.risk_flags),
        negotiation_points: JSON.stringify(result.negotiation_points),
        evidence_notes: JSON.stringify(result.evidence_notes),
        fair_market_range: result.fair_market_range
          ? JSON.stringify(result.fair_market_range)
          : null,
        fit_summary: result.fit_summary,
        missing_info_warnings: JSON.stringify(result.missing_info_warnings),
      },
    });
  } catch (err) {
    console.error("[/api/evaluate POST] evaluation save failed", err);
    return NextResponse.json(
      { error: "Failed to save evaluation" },
      { status: 500 }
    );
  }

  await logEvaluation({
    evaluation_id: savedEvaluation.id,
    raw_offer_text: offer.raw_offer_text,
    parsed_offer: parsedOffer,
    parse_trace: parseResult.trace,
    evaluation_result: result,
  });

  return NextResponse.json(
    { evaluation_id: savedEvaluation.id, result },
    { status: 200 }
  );
}
