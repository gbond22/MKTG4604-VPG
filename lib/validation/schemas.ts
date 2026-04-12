import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const PlatformSchema = z.enum(["instagram", "tiktok"]);
export type Platform = z.infer<typeof PlatformSchema>;

export const NicheSchema = z.enum([
  "beauty",
  "fitness",
  "lifestyle",
  "food",
  "consumer",
]);
export type Niche = z.infer<typeof NicheSchema>;

export const DecisionStatusSchema = z.enum([
  "ACCEPT",
  "NEGOTIATE",
  "DECLINE",
  "NEED_MORE_INFO",
]);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

// ---------------------------------------------------------------------------
// CreatorProfileInput
// ---------------------------------------------------------------------------

export const CreatorProfileInputSchema = z.object({
  platform: PlatformSchema,
  niche: NicheSchema,
  /** Total follower count — must be within supported range */
  followers: z.number().int().min(1000).max(1_000_000),
  /** Engagement rate as a decimal, e.g. 0.035 for 3.5% */
  engagement_rate: z.number().min(0).max(1),
  /** Average views per post/reel/video */
  avg_views: z.number().int().min(0),
  /** ISO 3166-1 alpha-2 country code, e.g. "US" */
  geography: z.string().min(2).max(2).toUpperCase(),
  /** Brands the creator cannot work with due to existing contracts */
  competitor_restrictions: z.array(z.string()).optional(),
  /** Creator's public handle (without @) */
  handle: z.string().optional(),
  /** Link to creator's profile */
  profile_url: z.url().optional(),
});
export type CreatorProfileInput = z.infer<typeof CreatorProfileInputSchema>;

// ---------------------------------------------------------------------------
// OfferInput
// ---------------------------------------------------------------------------

export const OfferInputSchema = z.object({
  /** Raw pasted offer text — treated as untrusted input */
  raw_offer_text: z.string().min(10).max(20_000),
  /** Optional URL to brand's website */
  brand_url: z.url().optional(),
  /** Optional brand social handle */
  brand_handle: z.string().optional(),
});
export type OfferInput = z.infer<typeof OfferInputSchema>;

// ---------------------------------------------------------------------------
// ParsedOffer — LLM output, validated by Zod before use
// ---------------------------------------------------------------------------

export const DeliverableSchema = z.object({
  type: z.enum([
    "reel",
    "post",
    "story",
    "video",
    "tiktok",
    "ugc",
    "livestream",
    "other",
  ]),
  quantity: z.number().int().min(1),
  notes: z.string().optional(),
});
export type Deliverable = z.infer<typeof DeliverableSchema>;

export const CompensationSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  type: z.enum(["flat_fee", "revenue_share", "gifted", "affiliate", "mixed"]),
  notes: z.string().optional(),
});
export type Compensation = z.infer<typeof CompensationSchema>;

export const UsageRightsSchema = z.object({
  scope: z.enum(["none", "organic_only", "paid_ads", "whitelisting", "broad"]),
  duration_months: z.number().int().min(0).optional(),
  territories: z.array(z.string()).optional(),
});
export type UsageRights = z.infer<typeof UsageRightsSchema>;

export const ParsedOfferSchema = z.object({
  // Required fields — absence triggers NEED_MORE_INFO
  compensation: CompensationSchema.nullable(),
  deliverables: z.array(DeliverableSchema).nullable(),
  usage_rights: UsageRightsSchema.nullable(),
  // Optional fields
  exclusivity: z
    .object({
      is_exclusive: z.boolean(),
      category: z.string().optional(),
      duration_months: z.number().int().min(0).optional(),
    })
    .optional(),
  deadlines: z
    .object({
      posting_date: z.string().optional(), // ISO date string
      draft_due: z.string().optional(),
      contract_due: z.string().optional(),
    })
    .optional(),
  revisions: z.number().int().min(0).optional(),
  payment_timing: z
    .enum(["upfront", "net_30", "net_60", "on_completion", "unknown"])
    .optional(),
  brand_name: z.string().optional(),
});
export type ParsedOffer = z.infer<typeof ParsedOfferSchema>;

// ---------------------------------------------------------------------------
// Scoring types
// ---------------------------------------------------------------------------

export const SubscoreBreakdownSchema = z.object({
  fair_pay: z.number().min(0).max(100),
  brand_risk: z.number().min(0).max(100),
  fit: z.number().min(0).max(100),
  terms_burden: z.number().min(0).max(100),
});
export type SubscoreBreakdown = z.infer<typeof SubscoreBreakdownSchema>;

export const RiskFlagSchema = z.object({
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum([
    "scam_signal",
    "payment_risk",
    "usage_rights",
    "exclusivity",
    "brand_legitimacy",
    "missing_info",
    "other",
  ]),
  description: z.string(),
});
export type RiskFlag = z.infer<typeof RiskFlagSchema>;

export const NegotiationPointSchema = z.object({
  priority: z.enum(["must_have", "nice_to_have", "informational"]),
  topic: z.string(),
  suggested_ask: z.string(),
  rationale: z.string().optional(),
});
export type NegotiationPoint = z.infer<typeof NegotiationPointSchema>;

export const EvidenceNoteSchema = z.object({
  source: z.enum(["benchmark", "brand_signal", "profile", "offer", "heuristic"]),
  note: z.string(),
});
export type EvidenceNote = z.infer<typeof EvidenceNoteSchema>;

// ---------------------------------------------------------------------------
// EvaluationResult
// ---------------------------------------------------------------------------

export const FairMarketRangeSchema = z.object({
  low: z.number().min(0),
  high: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  basis: z.string().optional(),
});
export type FairMarketRange = z.infer<typeof FairMarketRangeSchema>;

export const EvaluationResultSchema = z.object({
  decision_status: DecisionStatusSchema,
  /** 1–100 composite score; null when NEED_MORE_INFO */
  composite_score: z.number().min(1).max(100).nullable(),
  fair_market_range: FairMarketRangeSchema.nullable(),
  subscore_breakdown: SubscoreBreakdownSchema.nullable(),
  risk_flags: z.array(RiskFlagSchema),
  /** Plain-English summary of brand/creator fit */
  fit_summary: z.string().nullable(),
  negotiation_points: z.array(NegotiationPointSchema),
  evidence_notes: z.array(EvidenceNoteSchema),
  confidence_level: ConfidenceLevelSchema,
  missing_info_warnings: z.array(z.string()),
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

// ---------------------------------------------------------------------------
// Follow-up chat
// ---------------------------------------------------------------------------

export const FollowUpRequestSchema = z.object({
  evaluation_id: z.cuid(),
  user_question: z.string().min(1).max(2000),
});
export type FollowUpRequest = z.infer<typeof FollowUpRequestSchema>;

export const FollowUpResponseSchema = z.object({
  evaluation_id: z.cuid(),
  user_question: z.string(),
  system_response: z.string(),
  created_at: z.iso.datetime(),
});
export type FollowUpResponse = z.infer<typeof FollowUpResponseSchema>;

// ---------------------------------------------------------------------------
// ScoringConfig
// ---------------------------------------------------------------------------

export const ScoringWeightsSchema = z.object({
  fair_pay: z.number().min(0).max(1),
  brand_risk: z.number().min(0).max(1),
  fit: z.number().min(0).max(1),
  terms_burden: z.number().min(0).max(1),
});

export const HardStopRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  /** The forced decision when this rule fires */
  forces_decision: DecisionStatusSchema,
  severity: z.enum(["critical", "high"]),
});

export const ScoringConfigSchema = z.object({
  version: z.string(),
  weights: ScoringWeightsSchema,
  hard_stop_rules: z.array(HardStopRuleSchema),
  /** Min/max follower range considered supported */
  supported_follower_range: z.object({
    min: z.number().int(),
    max: z.number().int(),
  }),
  supported_platforms: z.array(PlatformSchema),
  supported_niches: z.array(NicheSchema),
});
export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;
export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>;
export type HardStopRule = z.infer<typeof HardStopRuleSchema>;

// ---------------------------------------------------------------------------
// Benchmark data
// ---------------------------------------------------------------------------

export const BenchmarkRecordSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  niche: NicheSchema,
  /** Follower tier label, e.g. "nano", "micro", "mid", "macro" */
  tier: z.enum(["nano", "micro", "mid", "macro"]),
  /** Min followers for this tier */
  followers_min: z.number().int(),
  /** Max followers for this tier */
  followers_max: z.number().int(),
  deliverable_type: z.string(),
  range_low: z.number().min(0),
  range_high: z.number().min(0),
  /** Data source citation */
  source: z.string(),
  year: z.number().int().optional(),
});
export type BenchmarkRecord = z.infer<typeof BenchmarkRecordSchema>;

// ---------------------------------------------------------------------------
// Brand signal data
// ---------------------------------------------------------------------------

export const BrandSignalRecordSchema = z.object({
  id: z.string(),
  brand_name: z.string(),
  brand_url: z.string().optional(),
  brand_handle: z.string().optional(),
  /** 1–5 overall review score from public sources */
  review_score: z.number().min(1).max(5).nullable(),
  complaint_notes: z.string().nullable(),
  social_presence: z.enum(["strong", "moderate", "weak", "none", "unknown"]),
  /** Structured flags: { is_verified, pays_on_time, known_scam, etc. } */
  legitimacy_flags: z.record(z.string(), z.boolean()),
  last_updated: z.string().optional(),
});
export type BrandSignalRecord = z.infer<typeof BrandSignalRecordSchema>;

// ---------------------------------------------------------------------------
// API request/response wrappers
// ---------------------------------------------------------------------------

export const EvaluateRequestSchema = z.object({
  profile: CreatorProfileInputSchema,
  offer: OfferInputSchema,
});
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
