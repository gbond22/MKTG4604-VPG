import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getScoringConfig } from "@/lib/data/scoring-config";
import type { EvaluationResult, ParsedOffer } from "@/lib/validation/schemas";
import type { OfferParseTrace } from "@/lib/ollama/parser";

const TRACE_FILE_PATH = join(
  process.cwd(),
  "trace",
  "evaluation-log.jsonl"
);
const PROMPT_TEMPLATE_VERSION = "v1";

interface EvaluationLogInput {
  evaluation_id?: string | null;
  raw_offer_text: string;
  parsed_offer: ParsedOffer;
  parse_trace: OfferParseTrace;
  evaluation_result: EvaluationResult;
}

interface FollowUpLogInput {
  evaluation_id: string;
  user_question: string;
  system_response: string;
}

async function appendEntry(entry: unknown): Promise<void> {
  try {
    await mkdir(dirname(TRACE_FILE_PATH), { recursive: true });
    await appendFile(TRACE_FILE_PATH, `${JSON.stringify(entry)}\n`, "utf8");
  } catch (err) {
    console.error("[trace logger] failed to append log entry", err);
  }
}

function getScoringWeights() {
  try {
    return getScoringConfig().weights;
  } catch (err) {
    console.error("[trace logger] failed to load scoring config", err);
    return null;
  }
}

export async function logEvaluation(input: EvaluationLogInput): Promise<void> {
  await appendEntry({
    kind: "evaluation",
    timestamp: new Date().toISOString(),
    prompt_template_version: PROMPT_TEMPLATE_VERSION,
    scoring_weights: getScoringWeights(),
    evaluation_id: input.evaluation_id ?? null,
    raw_offer_text: input.raw_offer_text,
    parsed_offer: {
      status: input.parse_trace.status === "success" ? "success" : "failure",
      parser_used: input.parse_trace.parser_used,
      error: input.parse_trace.error,
      output: input.parsed_offer,
    },
    evaluation_result: input.evaluation_result,
    confidence_level: input.evaluation_result.confidence_level,
  });
}

export async function logFollowUp(input: FollowUpLogInput): Promise<void> {
  await appendEntry({
    kind: "follow_up",
    timestamp: new Date().toISOString(),
    evaluation_id: input.evaluation_id,
    user_question: input.user_question,
    system_response: input.system_response,
  });
}
