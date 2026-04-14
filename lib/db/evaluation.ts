import { prisma } from "@/lib/prisma";
import {
  EvaluationResultSchema,
  type EvaluationResult,
} from "@/lib/validation/schemas";

export interface ProfileSummary {
  platform: string;
  niche: string;
  followers: number;
  engagement_rate: number;
  handle: string | null;
  geography: string;
}

export interface BrandSummary {
  name: string | null;
  handle: string | null;
  url: string | null;
}

export interface EvaluationRecord {
  id: string;
  profile_id: string;
  result: EvaluationResult;
  profile: ProfileSummary;
  brand: BrandSummary;
  createdAt: Date;
}

/**
 * Fetch a saved Evaluation row by id and reconstruct the full EvaluationResult.
 * Includes the linked CreatorProfile and BrandOffer for export/display purposes.
 * Returns null if the row doesn't exist or the stored JSON fails validation.
 */
export async function getEvaluationById(
  id: string
): Promise<EvaluationRecord | null> {
  const row = await prisma.evaluation.findUnique({
    where: { id },
    include: { profile: true, offer: true },
  });
  if (!row) return null;

  const raw = {
    decision_status: row.decision_status,
    composite_score: row.composite_score,
    confidence_level: row.confidence_level,
    subscore_breakdown: row.subscore_breakdown
      ? JSON.parse(row.subscore_breakdown)
      : null,
    risk_flags: JSON.parse(row.risk_flags),
    negotiation_points: JSON.parse(row.negotiation_points),
    evidence_notes: row.evidence_notes ? JSON.parse(row.evidence_notes) : [],
    fair_market_range: row.fair_market_range
      ? JSON.parse(row.fair_market_range)
      : null,
    fit_summary: row.fit_summary ?? null,
    missing_info_warnings: JSON.parse(row.missing_info_warnings),
  };

  const parsed = EvaluationResultSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      "[getEvaluationById] stored data failed validation",
      parsed.error.flatten()
    );
    return null;
  }

  return {
    id: row.id,
    profile_id: row.profile_id,
    result: parsed.data,
    profile: {
      platform: row.profile.platform,
      niche: row.profile.niche,
      followers: row.profile.followers,
      engagement_rate: row.profile.engagement_rate,
      handle: row.profile.handle,
      geography: row.profile.geography,
    },
    brand: {
      name: row.offer.brand_name,
      handle: row.offer.brand_handle,
      url: row.offer.brand_url,
    },
    createdAt: row.created_at,
  };
}
