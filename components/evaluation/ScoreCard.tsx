import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { EvaluationResult } from "@/lib/validation/schemas";

const DECISION_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  ACCEPT: { label: "Accept", variant: "default" },
  NEGOTIATE: { label: "Negotiate", variant: "secondary" },
  DECLINE: { label: "Decline", variant: "destructive" },
  NEED_MORE_INFO: { label: "Need More Info", variant: "outline" },
};

const SUBSCORE_LABELS = [
  { key: "fair_pay", label: "Fair Pay", weight: "35%" },
  { key: "brand_risk", label: "Brand Risk", weight: "30%" },
  { key: "fit", label: "Fit", weight: "20%" },
  { key: "terms_burden", label: "Terms Burden", weight: "15%" },
] as const;

interface ScoreCardProps {
  result: EvaluationResult | null;
}

export function ScoreCard({ result }: ScoreCardProps) {
  const badge = result
    ? DECISION_BADGE[result.decision_status]
    : { label: "Pending", variant: "outline" as const };

  const score = result?.composite_score ?? null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Evaluation Score</CardTitle>
            <CardDescription className="mt-0.5">
              Composite score based on pay, brand risk, fit, and terms.
            </CardDescription>
          </div>
          <Badge variant={badge.variant} className="shrink-0">
            {badge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Missing-info warnings */}
        {result?.missing_info_warnings &&
          result.missing_info_warnings.length > 0 && (
            <ul className="space-y-1">
              {result.missing_info_warnings.map((w, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  · {w}
                </li>
              ))}
            </ul>
          )}

        {/* Composite score */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Overall</span>
            <span
              className={
                score !== null
                  ? "text-2xl font-bold tabular-nums"
                  : "text-2xl font-bold tabular-nums text-muted-foreground"
              }
            >
              {score !== null ? score : "—"}
            </span>
          </div>
          <Progress value={score ?? 0} className="h-2" />
        </div>

        {/* Sub-scores */}
        <div className="space-y-3">
          {SUBSCORE_LABELS.map(({ key, label, weight }) => {
            const val = result?.subscore_breakdown?.[key] ?? null;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">
                    {label}{" "}
                    <span className="font-medium text-muted-foreground/60">
                      {weight}
                    </span>
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {val !== null ? val : "—"}
                  </span>
                </div>
                <Progress value={val ?? 0} className="h-1" />
              </div>
            );
          })}
        </div>

        {/* Market range */}
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Fair market range: </span>
          {result?.fair_market_range ? (
            <span className="font-medium">
              {result.fair_market_range.currency}{" "}
              {result.fair_market_range.low.toLocaleString()}–
              {result.fair_market_range.high.toLocaleString()}
              {result.fair_market_range.basis && (
                <span className="text-muted-foreground">
                  {" "}
                  ({result.fair_market_range.basis})
                </span>
              )}
            </span>
          ) : (
            <span className="font-medium text-muted-foreground">—</span>
          )}
        </div>

        {/* Confidence */}
        {result && (
          <p className="text-xs text-muted-foreground">
            Confidence:{" "}
            <span className="font-medium capitalize">
              {result.confidence_level}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
