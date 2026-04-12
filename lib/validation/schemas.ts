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
  flag: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  detail: z.string(),
});
export type RiskFlag = z.infer<typeof RiskFlagSchema>;

export const NegotiationPrioritySchema = z.enum([
  "must_have",
  "nice_to_have",
  "informational",
  "high",
  "medium",
  "low",
]);

export const NegotiationPointSchema = z.object({
  point: z.string(),
  priority: NegotiationPrioritySchema,
  category: z.string(),
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
  evidence_notes: z.array(EvidenceNoteSchema).optional().default([]),
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

export const HardStopActionSchema = z.enum([
  "FORCE_DECLINE",
  "NEED_MORE_INFO",
  "LOW_CONFIDENCE_WARNING",
]);

export const HardStopRuleSchema = z.object({
  id: z.string(),
  condition: z.string(),
  action: HardStopActionSchema,
});

export const ScoringConfigSchema = z.object({
  weights: ScoringWeightsSchema,
  hard_stop_rules: z.array(HardStopRuleSchema),
  decision_thresholds: z.object({
    accept_min: z.number().min(0).max(100),
    negotiate_min: z.number().min(0).max(100),
    decline_below: z.number().min(0).max(100),
  }),
});
export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;
export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>;
export type HardStopRule = z.infer<typeof HardStopRuleSchema>;

// ---------------------------------------------------------------------------
// Benchmark data
// ---------------------------------------------------------------------------

export const BenchmarkFixturePlatformSchema = z.enum(["Instagram", "TikTok"]);
export const BenchmarkFixtureNicheSchema = z.enum([
  "beauty",
  "fitness",
  "lifestyle",
  "food",
  "consumer_products",
]);
export const BenchmarkDeliverableSchema = z.enum([
  "Reel",
  "Story",
  "Post",
  "Video",
  "Bundle",
]);

export const BenchmarkRecordSchema = z.object({
  platform: BenchmarkFixturePlatformSchema,
  niche: BenchmarkFixtureNicheSchema,
  follower_range_min: z.number().int(),
  follower_range_max: z.number().int(),
  deliverable: BenchmarkDeliverableSchema,
  min_rate: z.number().min(0),
  max_rate: z.number().min(0),
  avg_rate: z.number().min(0),
  source: z.string(),
});
export type BenchmarkRecord = z.infer<typeof BenchmarkRecordSchema>;

// ---------------------------------------------------------------------------
// Brand signal data
// ---------------------------------------------------------------------------

export const BrandSignalRecordSchema = z.object({
  brand_name: z.string(),
  brand_url: z.string().url(),
  /** 1–5 overall review score from public sources */
  review_score: z.number().min(1).max(5).nullable(),
  complaint_notes: z.string().nullable(),
  social_presence: z.boolean(),
  legitimacy_flags: z.object({
    has_website: z.boolean(),
    has_social: z.boolean(),
    has_reviews: z.boolean(),
    known_complaints: z.boolean(),
    is_verified: z.boolean(),
  }),
});
export type BrandSignalRecord = z.infer<typeof BrandSignalRecordSchema>;

// ---------------------------------------------------------------------------
// API request/response wrappers
// ---------------------------------------------------------------------------

export const EvaluateRequestSchema = z.object({
  profile_id: z.string().min(1),
  offer: OfferInputSchema,
});
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
