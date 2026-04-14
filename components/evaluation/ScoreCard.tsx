import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/validation/schemas";

const DECISION_META = {
  ACCEPT: {
    label: "Accept",
    badgeClassName: "border-[#1B6B6D]/30 bg-[#1B6B6D]/15 text-[#1B6B6D]",
  },
  NEGOTIATE: {
    label: "Negotiate",
    badgeClassName: "border-[#D4A84B]/30 bg-[#D4A84B]/15 text-[#D4A84B]",
  },
  DECLINE: {
    label: "Decline",
    badgeClassName: "border-[#C4613A]/30 bg-[#C4613A]/15 text-[#C4613A]",
  },
  NEED_MORE_INFO: {
    label: "Need More Info",
    badgeClassName: "border-[#D4D0CA] bg-[#D4D0CA] text-[#999999]",
  },
} as const;

const SUBSCORE_LABELS = [
  { key: "fair_pay", label: "Fair Pay" },
  { key: "brand_risk", label: "Brand Risk" },
  { key: "fit", label: "Fit" },
  { key: "terms_burden", label: "Terms Burden" },
] as const;

interface ScoreCardProps {
  result: EvaluationResult | null;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Returns a progress bar color class based on the numeric score value. */
function scoreProgressClass(value: number | null): string {
  if (value === null) return "bg-[#D4D0CA]";
  if (value >= 70) return "bg-[#1B6B6D]";
  if (value >= 50) return "bg-[#D4A84B]";
  return "bg-[#C4613A]";
}

export function ScoreCard({ result }: ScoreCardProps) {
  const decision =
    result !== null
      ? DECISION_META[result.decision_status]
      : {
          label: "Pending",
          badgeClassName: "border-[#D4D0CA] bg-[#D4D0CA] text-[#999999]",
        };

  const score = result?.composite_score ?? null;
  const subscoreBreakdown = result?.subscore_breakdown;
  const marketRange = result?.fair_market_range;

  return (
    <Card className="rounded-2xl shadow-sm border-[#D4D0CA] bg-[#F5F0EB]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base text-[#1A1A2E]">Evaluation Score</CardTitle>
            <CardDescription className="mt-0.5 text-[#999999]">
              Decision, score breakdown, and benchmark-based market range.
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn("shrink-0", decision.badgeClassName)}>
            {decision.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#D4D0CA] bg-[#EDE7DF]/50">
            <p className="text-sm text-[#999999]">
              Submit an offer to see the full evaluation.
            </p>
          </div>
        ) : (
          <>
            {result.missing_info_warnings.length > 0 && (
              <div className="rounded-xl border border-[#D4A84B]/30 bg-[#D4A84B]/10 px-4 py-3">
                <p className="text-sm font-medium text-[#2D2D3F]">
                  More detail would improve this evaluation.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-[#2D2D3F]/80">
                  {result.missing_info_warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-[#D4D0CA] bg-[#EDE7DF]/50 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-[#999999]">Composite Score</p>
                  <p className="text-4xl font-semibold tabular-nums tracking-tight text-[#1A1A2E]">
                    {score ?? "—"}
                  </p>
                </div>
                <p className="text-sm text-[#999999]">Out of 100</p>
              </div>

              <Progress value={score ?? 0} className="mt-4 gap-0">
                <ProgressTrack className="h-3 rounded-full bg-[#D4D0CA]">
                  <ProgressIndicator
                    className={cn("rounded-full transition-all", scoreProgressClass(score))}
                  />
                </ProgressTrack>
              </Progress>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {SUBSCORE_LABELS.map(({ key, label }) => {
                const value = subscoreBreakdown?.[key] ?? null;

                return (
                  <div key={key} className="rounded-xl border border-[#D4D0CA] bg-[#EDE7DF]/50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#2D2D3F]">{label}</span>
                      <span className="text-sm tabular-nums text-[#999999]">
                        {value ?? "—"}
                      </span>
                    </div>
                    <Progress value={value ?? 0} className="gap-0">
                      <ProgressTrack className="h-2 rounded-full bg-[#D4D0CA]">
                        <ProgressIndicator className={cn("rounded-full", scoreProgressClass(value))} />
                      </ProgressTrack>
                    </Progress>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-[#D4D0CA] bg-[#EDE7DF]/50 px-4 py-3">
              <p className="text-sm text-[#999999]">Fair Market Range</p>
              <p className="mt-1 text-lg font-semibold text-[#1A1A2E]">
                {marketRange
                  ? `${formatMoney(marketRange.low, marketRange.currency)} - ${formatMoney(marketRange.high, marketRange.currency)}`
                  : "Unavailable"}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
