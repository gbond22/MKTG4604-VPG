/**
 * Mock offer parser — returns a hardcoded ParsedOffer for testing.
 *
 * In production (step 13+) this is replaced by an LLM parser that extracts
 * the structured offer fields from raw_offer_text. For now it returns a
 * deterministic result so the scoring pipeline can be tested end-to-end.
 *
 * The LLM never influences the numeric score — it only extracts structured
 * fields that are then fed into the deterministic engine.
 */

import type { ParsedOffer } from "@/lib/validation/schemas";

/**
 * Parse raw offer text into a structured ParsedOffer.
 *
 * @param _rawText  The pasted offer text (unused by the mock).
 * @param _brandName  Optional brand name hint (unused by the mock).
 * @returns A hardcoded ParsedOffer representing a typical mid-range offer.
 */
export function parseOffer(
  _rawText: string,
  _brandName?: string | null
): ParsedOffer {
  return {
    brand_name: "GlowCo Cosmetics",
    compensation: {
      amount: 800,
      currency: "USD",
      type: "flat_fee",
    },
    deliverables: [
      { type: "reel", quantity: 1 },
      { type: "story", quantity: 3 },
    ],
    usage_rights: {
      scope: "organic_only",
      duration_months: 3,
    },
    exclusivity: {
      is_exclusive: false,
    },
    payment_timing: "net_30",
    revisions: 2,
    deadlines: {
      posting_date: "2026-05-15",
      draft_due: "2026-05-10",
    },
  };
}
