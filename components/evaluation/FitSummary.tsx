import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/validation/schemas";

const CONFIDENCE_META = {
  high: {
    label: "High Confidence",
    className: "border-[#1B6B6D]/30 bg-[#1B6B6D]/15 text-[#1B6B6D]",
  },
  medium: {
    label: "Medium Confidence",
    className: "border-[#D4A84B]/30 bg-[#D4A84B]/15 text-[#D4A84B]",
  },
  low: {
    label: "Low Confidence",
    className: "border-[#4A6FA5]/30 bg-[#4A6FA5]/15 text-[#4A6FA5]",
  },
} as const;

interface FitSummaryProps {
  result: EvaluationResult | null;
}

export function FitSummary({ result }: FitSummaryProps) {
  const summary = result?.fit_summary ?? null;
  const confidence = result ? CONFIDENCE_META[result.confidence_level] : null;

  return (
    <Card className="rounded-2xl shadow-sm border-[#D4D0CA] bg-[#F5F0EB]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base text-[#1A1A2E]">Brand &amp; Audience Fit</CardTitle>
          {confidence && (
            <Badge variant="outline" className={cn("shrink-0", confidence.className)}>
              {confidence.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#D4D0CA] bg-[#EDE7DF]/50">
            <p className="text-sm text-[#999999]">No evaluation yet.</p>
          </div>
        ) : summary ? (
          <p className="text-sm leading-7 text-[#2D2D3F]">{summary}</p>
        ) : (
          <div className="rounded-xl border border-[#D4D0CA] bg-[#EDE7DF]/50 px-4 py-6">
            <p className="text-sm text-[#999999]">
              Fit summary is unavailable until the offer has enough detail to score.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
