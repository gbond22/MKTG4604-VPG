import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EvaluationResult } from "@/lib/validation/schemas";

const SEVERITY_VARIANT = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const satisfies Record<string, "destructive" | "secondary" | "outline">;

const SEVERITY_LABEL = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

interface RiskFlagsProps {
  result: EvaluationResult | null;
}

export function RiskFlags({ result }: RiskFlagsProps) {
  const flags = result?.risk_flags ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Risk Flags
          {flags.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({flags.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {flags.length === 0 ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-md border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              {result ? "No risk flags." : "No evaluation yet."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {flags.map((flag, i) => (
              <li key={i} className="flex gap-3">
                <Badge
                  variant={SEVERITY_VARIANT[flag.severity]}
                  className="shrink-0 self-start text-xs"
                >
                  {SEVERITY_LABEL[flag.severity]}
                </Badge>
                <span className="text-sm text-foreground">
                  {flag.description}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
