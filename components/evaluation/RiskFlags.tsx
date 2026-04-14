import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/validation/schemas";

const SEVERITY_META = {
  critical: {
    label: "Critical",
    badgeClassName: "border-[#C4613A]/30 bg-[#C4613A]/15 text-[#C4613A]",
    order: 0,
  },
  high: {
    label: "High",
    badgeClassName: "border-[#C4613A]/30 bg-[#C4613A]/15 text-[#C4613A]",
    order: 1,
  },
  medium: {
    label: "Medium",
    badgeClassName: "border-[#D4A84B]/30 bg-[#D4A84B]/15 text-[#D4A84B]",
    order: 2,
  },
  low: {
    label: "Low",
    badgeClassName: "border-[#4A6FA5]/30 bg-[#4A6FA5]/15 text-[#4A6FA5]",
    order: 3,
  },
} as const;

interface RiskFlagsProps {
  result: EvaluationResult | null;
}

export function RiskFlags({ result }: RiskFlagsProps) {
  const flags = [...(result?.risk_flags ?? [])].sort(
    (a, b) => SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order
  );

  return (
    <Card className="rounded-2xl shadow-sm border-[#D4D0CA] bg-[#F5F0EB]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#1A1A2E]">
          Risk Flags
          {result && (
            <span className="ml-2 text-sm font-normal text-[#999999]">
              ({flags.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#D4D0CA] bg-[#EDE7DF]/50">
            <p className="text-sm text-[#999999]">No evaluation yet.</p>
          </div>
        ) : flags.length === 0 ? (
          <div className="rounded-xl border border-[#D4D0CA] bg-[#EDE7DF]/50 px-4 py-6 text-center">
            <p className="text-sm text-[#999999]">
              No risk flags were raised for this deal.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {flags.map((flag, index) => {
              const severity = SEVERITY_META[flag.severity];

              return (
                <li key={`${flag.category}-${index}`} className="rounded-xl border border-[#D4D0CA] bg-[#EDE7DF]/40 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", severity.badgeClassName)}
                    >
                      {severity.label}
                    </Badge>
                    <span className="text-sm font-medium capitalize text-[#2D2D3F]">
                      {flag.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#999999]">
                    {flag.description}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
12