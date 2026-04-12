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
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    progressClassName: "bg-emerald-500",
  },
  NEGOTIATE: {
    label: "Negotiate",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    progressClassName: "bg-amber-500",
  },
  DECLINE: {
    label: "Decline",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    progressClassName: "bg-rose-500",
  },
  NEED_MORE_INFO: {
    label: "Need More Info",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
    progressClassName: "bg-slate-400",
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

export function ScoreCard({ result }: ScoreCardProps) {
  const decision =
    result !== null
      ? DECISION_META[result.decision_status]
      : {
          label: "Pending",
          badgeClassName: "border-border bg-muted text-muted-foreground",
          progressClassName: "bg-muted-foreground/40",
        };

  const score = result?.composite_score ?? null;
  const subscoreBreakdown = result?.subscore_breakdown;
  const marketRange = result?.fair_market_range;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Evaluation Score</CardTitle>
            <CardDescription className="mt-0.5">
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
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Submit an offer to see the full evaluation.
            </p>
          </div>
        ) : (
          <>
            {result.missing_info_warnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-900">
                  More detail would improve this evaluation.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  {result.missing_info_warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Composite Score</p>
                  <p className="text-4xl font-semibold tabular-nums tracking-tight">
                    {score ?? "—"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Out of 100</p>
              </div>

              <Progress value={score ?? 0} className="mt-4 gap-0">
                <ProgressTrack className="h-3 rounded-full bg-muted">
                  <ProgressIndicator
                    className={cn("rounded-full transition-all", decision.progressClassName)}
                  />
                </ProgressTrack>
              </Progress>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {SUBSCORE_LABELS.map(({ key, label }) => {
                const value = subscoreBreakdown?.[key] ?? null;

                return (
                  <div key={key} className="rounded-xl border border-border bg-background p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {value ?? "—"}
                      </span>
                    </div>
                    <Progress value={value ?? 0} className="gap-0">
                      <ProgressTrack className="h-2 rounded-full bg-muted">
                        <ProgressIndicator className="rounded-full bg-primary" />
                      </ProgressTrack>
                    </Progress>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-sm text-muted-foreground">Fair Market Range</p>
              <p className="mt-1 text-lg font-semibold">
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
