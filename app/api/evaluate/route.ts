import { NextRequest, NextResponse } from "next/server";

/**
 * /api/evaluate
 *
 * POST — accepts EvaluateRequest { profile, offer }, returns EvaluationResult.
 *
 * TODO (step 8+): validate EvaluateRequestSchema → required-fields gate →
 *                benchmark lookup → brand-signal lookup → deterministic
 *                scoring engine → Ollama parser → return EvaluationResult.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { message: "Evaluate endpoint — coming in steps 8–10." },
    { status: 501 }
  );
}
