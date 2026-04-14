import { NextRequest, NextResponse } from "next/server";
import { FollowUpRequestSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/prisma";
import { generateTemplateResponse } from "@/lib/chat/template-responder";
import type { StoredEvaluationContext } from "@/lib/chat/template-responder";
import { chat } from "@/lib/ollama/client";
import type {
  RiskFlag,
  NegotiationPoint,
  EvidenceNote,
  FairMarketRange,
  SubscoreBreakdown,
} from "@/lib/validation/schemas";
import { logFollowUp } from "@/lib/trace/logger";

/**
 * POST /api/follow-up
 *
 * Pipeline:
 *   1. Validate { evaluation_id, user_question }
 *   2. Load Evaluation + its JSON fields from DB
 *   3. Generate a template-based response
 *   4. Persist the FollowUp record
 *   5. Return { system_response }
 *
 * Step 12 swaps step 3 for an Ollama prompt — the interface is unchanged.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = FollowUpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { evaluation_id, user_question } = parsed.data;

  // ── 1. Load evaluation ─────────────────────────────────────────────────────
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluation_id },
  });

  if (!evaluation) {
    return NextResponse.json(
      { error: "Evaluation not found" },
      { status: 404 }
    );
  }

  // ── 2. Deserialise JSON fields ─────────────────────────────────────────────
  function parseJsonField<T>(raw: string | null | undefined, fallback: T): T {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  const ctx: StoredEvaluationContext = {
    decision_status: evaluation.decision_status,
    composite_score: evaluation.composite_score,
    confidence_level: evaluation.confidence_level,
    subscore_breakdown: parseJsonField<SubscoreBreakdown | null>(
      evaluation.subscore_breakdown,
      null
    ),
    risk_flags: parseJsonField<RiskFlag[]>(evaluation.risk_flags, []),
    negotiation_points: parseJsonField<NegotiationPoint[]>(
      evaluation.negotiation_points,
      []
    ),
    evidence_notes: parseJsonField<EvidenceNote[]>(evaluation.evidence_notes, []),
    fair_market_range: parseJsonField<FairMarketRange | null>(
      evaluation.fair_market_range,
      null
    ),
    fit_summary: evaluation.fit_summary,
    missing_info_warnings: parseJsonField<string[]>(
      evaluation.missing_info_warnings,
      []
    ),
  };

  // ── 3. Generate response ───────────────────────────────────────────────────
  let systemResponse: string;

  if (process.env.OLLAMA_ENABLED !== "false") {
    try {
      const systemPrompt = [
        "You are a brand deal advisor helping a creator understand their evaluation results.",
        "Answer the user's question based solely on the evaluation data below.",
        "Be concise and direct. Do not hallucinate data not present in the evaluation.",
        "",
        "Evaluation data:",
        JSON.stringify(ctx, null, 2),
      ].join("\n");

      const ollamaResponse = await chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: user_question },
      ]);

      systemResponse = ollamaResponse.trim() || generateTemplateResponse(user_question, ctx);
    } catch {
      systemResponse = generateTemplateResponse(user_question, ctx);
    }
  } else {
    systemResponse = generateTemplateResponse(user_question, ctx);
  }

  // ── 4. Persist follow-up ───────────────────────────────────────────────────
  try {
    await prisma.followUp.create({
      data: {
        evaluation_id,
        user_question,
        system_response: systemResponse,
      },
    });
  } catch (err) {
    // Non-fatal — log and continue; the client still gets the response
    console.error("[/api/follow-up POST] follow-up save failed", err);
  }

  await logFollowUp({
    evaluation_id,
    user_question,
    system_response: systemResponse,
  });

  return NextResponse.json({ system_response: systemResponse }, { status: 200 });
}
