import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/validation/schemas";

const CONFIDENCE_META = {
  high: {
    label: "High Confidence",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  medium: {
    label: "Medium Confidence",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  low: {
    label: "Low Confidence",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
} as const;

interface FitSummaryProps {
  result: EvaluationResult | null;
}

export function FitSummary({ result }: FitSummaryProps) {
  const summary = result?.fit_summary ?? null;
  const confidence = result ? CONFIDENCE_META[result.confidence_level] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base">Brand &amp; Audience Fit</CardTitle>
          {confidence && (
            <Badge variant="outline" className={cn("shrink-0", confidence.className)}>
              {confidence.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">No evaluation yet.</p>
          </div>
        ) : summary ? (
          <p className="text-sm leading-7 text-foreground">{summary}</p>
        ) : (
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-6">
            <p className="text-sm text-muted-foreground">
              Fit summary is unavailable until the offer has enough detail to score.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
