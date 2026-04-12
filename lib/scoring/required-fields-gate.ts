import type { ParsedOffer } from "@/lib/validation/schemas";

export interface GateResult {
  passed: boolean;
  /** Names of the required fields that are absent. */
  missing: ("compensation" | "deliverables" | "usage_rights")[];
}

/**
 * Gate that enforces the three required fields.
 * Any null/empty field triggers NEED_MORE_INFO — the scoring engine
 * must not proceed to calculate a composite score without all three.
 */
export function requiredFieldsGate(offer: ParsedOffer): GateResult {
  const missing: GateResult["missing"] = [];

  if (offer.compensation === null) {
    missing.push("compensation");
  }
  if (offer.deliverables === null || offer.deliverables.length === 0) {
    missing.push("deliverables");
  }
  if (offer.usage_rights === null) {
    missing.push("usage_rights");
  }

  return { passed: missing.length === 0, missing };
}
