import { NextRequest, NextResponse } from "next/server";
import { EvaluateRequestSchema } from "@/lib/validation/schemas";
import { getProfileById } from "@/lib/db/profile";
import { prisma } from "@/lib/prisma";
import type { EvaluationResult } from "@/lib/validation/schemas";

/**
 * POST /api/evaluate
 * Accepts { profile_id, offer }, validates both, persists the raw offer,
 * and returns a stub EvaluationResult.
 *
 * Steps 7–10 will replace the stub with:
 *   mocked parser → required-fields gate → deterministic scoring engine.
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

  // Verify the profile exists
  const profile = await getProfileById(profile_id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Persist the raw offer
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

  // --- Stub evaluation result ---
  // Steps 7–10 replace this with the real scoring pipeline.
  const stubResult: EvaluationResult = {
    decision_status: "NEED_MORE_INFO",
    composite_score: null,
    fair_market_range: null,
    subscore_breakdown: null,
    risk_flags: [],
    fit_summary: null,
    negotiation_points: [],
    evidence_notes: [],
    confidence_level: "low",
    missing_info_warnings: [
      "Offer parsing not yet implemented — this is a stub result.",
      "Complete steps 7–10 to enable full evaluation.",
    ],
  };

  // Persist the stub evaluation
  let savedEvaluation;
  try {
    savedEvaluation = await prisma.evaluation.create({
      data: {
        offer_id: savedOffer.id,
        profile_id: profile.id,
        decision_status: stubResult.decision_status,
        composite_score: stubResult.composite_score,
        confidence_level: stubResult.confidence_level,
        risk_flags: JSON.stringify(stubResult.risk_flags),
        negotiation_points: JSON.stringify(stubResult.negotiation_points),
        evidence_notes: JSON.stringify(stubResult.evidence_notes),
        missing_info_warnings: JSON.stringify(stubResult.missing_info_warnings),
      },
    });
  } catch (err) {
    console.error("[/api/evaluate POST] evaluation save failed", err);
    return NextResponse.json(
      { error: "Failed to save evaluation" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { evaluation_id: savedEvaluation.id, result: stubResult },
    { status: 200 }
  );
}
