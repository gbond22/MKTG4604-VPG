import { NextRequest, NextResponse } from "next/server";

/**
 * /api/follow-up
 *
 * POST — accepts FollowUpRequest { evaluation_id, user_question },
 *        returns FollowUpResponse { system_response }.
 *
 * TODO (step 11): load saved EvaluationResult from DB, build context-aware
 *                Ollama prompt, return and persist follow-up response.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { message: "Follow-up endpoint — coming in step 11." },
    { status: 501 }
  );
}
