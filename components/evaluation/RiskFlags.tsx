import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/validation/schemas";

const SEVERITY_META = {
  critical: {
    label: "Critical",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    order: 0,
  },
  high: {
    label: "High",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
    order: 1,
  },
  medium: {
    label: "Medium",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    order: 2,
  },
  low: {
    label: "Low",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Risk Flags
          {result && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({flags.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">No evaluation yet.</p>
          </div>
        ) : flags.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No risk flags were raised for this deal.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {flags.map((flag, index) => {
              const severity = SEVERITY_META[flag.severity];

              return (
                <li key={`${flag.flag}-${index}`} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", severity.badgeClassName)}
                    >
                      {severity.label}
                    </Badge>
                    <span className="text-sm font-medium">{flag.flag}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {flag.detail}
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
