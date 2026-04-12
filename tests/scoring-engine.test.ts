import { describe, expect, it } from "vitest";
import {
  runScoringEngine,
  type ScoringInput,
} from "../lib/scoring/engine";
import type {
  BrandSignalRecord,
  ParsedOffer,
} from "../lib/validation/schemas";

function buildProfile(
  overrides: Partial<ScoringInput["profile"]> = {}
): ScoringInput["profile"] {
  return {
    id: "profile_test_1",
    user_id: null,
    platform: "instagram",
    niche: "beauty",
    followers: 55000,
    engagement_rate: 0.041,
    avg_views: 18000,
    geography: "US",
    competitor_restrictions: null,
    handle: "creatorhandle",
    profile_url: "https://instagram.com/creatorhandle",
    audience_demographics: null,
    normalized_metrics: null,
    created_at: new Date("2026-04-01T00:00:00.000Z"),
    updated_at: new Date("2026-04-01T00:00:00.000Z"),
    ...overrides,
  };
}

function buildParsedOffer(overrides: Partial<ParsedOffer> = {}): ParsedOffer {
  return {
    brand_name: "LumaSkin Collective",
    compensation: {
      amount: 1800,
      currency: "USD",
      type: "flat_fee",
    },
    deliverables: [{ type: "reel", quantity: 1 }],
    usage_rights: {
      scope: "organic_only",
      duration_months: 3,
    },
    exclusivity: {
      is_exclusive: false,
    },
    payment_timing: "net_30",
    revisions: 1,
    ...overrides,
  };
}

describe("runScoringEngine", () => {
  it("returns a full evaluation for a complete supported offer", () => {
    const result = runScoringEngine({
      parsedOffer: buildParsedOffer(),
      profile: buildProfile(),
      brandUrl: "https://lumaskincollective.com",
    });

    expect(["ACCEPT", "NEGOTIATE", "DECLINE"]).toContain(
      result.decision_status
    );
    expect(result.composite_score).not.toBeNull();
    expect(result.composite_score).toBeGreaterThanOrEqual(1);
    expect(result.composite_score).toBeLessThanOrEqual(100);
    expect(result.subscore_breakdown).not.toBeNull();
    expect(result.subscore_breakdown).toMatchObject({
      fair_pay: expect.any(Number),
      brand_risk: expect.any(Number),
      fit: expect.any(Number),
      terms_burden: expect.any(Number),
    });
    expect(result.evidence_notes.length).toBeGreaterThan(0);
  });

  it("returns NEED_MORE_INFO when compensation is missing", () => {
    const result = runScoringEngine({
      parsedOffer: buildParsedOffer({ compensation: null }),
      profile: buildProfile(),
      brandUrl: "https://lumaskincollective.com",
    });

    expect(result.decision_status).toBe("NEED_MORE_INFO");
    expect(result.composite_score).toBeNull();
    expect(result.missing_info_warnings.some((warning) =>
      warning.toLowerCase().includes("compensation")
    )).toBe(true);
  });

  it("returns NEED_MORE_INFO when deliverables are missing", () => {
    const result = runScoringEngine({
      parsedOffer: buildParsedOffer({ deliverables: null }),
      profile: buildProfile(),
      brandUrl: "https://lumaskincollective.com",
    });

    expect(result.decision_status).toBe("NEED_MORE_INFO");
    expect(result.composite_score).toBeNull();
  });

  it("returns NEED_MORE_INFO when usage rights are missing", () => {
    const result = runScoringEngine({
      parsedOffer: buildParsedOffer({ usage_rights: null }),
      profile: buildProfile(),
      brandUrl: "https://lumaskincollective.com",
    });

    expect(result.decision_status).toBe("NEED_MORE_INFO");
    expect(result.composite_score).toBeNull();
  });

  it("returns DECLINE for a scam brand even when compensation is high", () => {
    const scamBrand: BrandSignalRecord = {
      brand_name: "Scam Brand",
      brand_url: "https://scam-brand.test",
      review_score: 1.5,
      complaint_notes:
        "Multiple creators report non-payment after content delivery.",
      social_presence: false,
      legitimacy_flags: {
        has_website: false,
        has_social: false,
        has_reviews: false,
        known_complaints: true,
        is_verified: false,
      },
    };

    const result = runScoringEngine({
      parsedOffer: buildParsedOffer({
        brand_name: "Scam Brand",
        compensation: {
          amount: 25000,
          currency: "USD",
          type: "flat_fee",
        },
      }),
      profile: buildProfile(),
      brandUrl: scamBrand.brand_url,
      brandSignalOverride: scamBrand,
    });

    expect(result.decision_status).toBe("DECLINE");
    expect(result.composite_score).toBeNull();
    expect(result.risk_flags.length).toBeGreaterThan(0);
  });
});
