import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * RiskFlags — placeholder shell.
 *
 * Will display a list of RiskFlag objects, each with:
 *   - severity badge (critical / high / medium / low)
 *   - category label
 *   - description text
 *
 * TODO (step 10): accept risk_flags: RiskFlag[] prop and render live data.
 */
export function RiskFlags() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Risk Flags</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Placeholder empty state */}
        <div className="flex min-h-[80px] items-center justify-center rounded-md border border-dashed border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No evaluation yet.</p>
            <div className="mt-2 flex justify-center gap-1.5">
              <Badge variant="destructive" className="text-xs opacity-30">
                Critical
              </Badge>
              <Badge variant="outline" className="text-xs opacity-30">
                High
              </Badge>
              <Badge variant="secondary" className="text-xs opacity-30">
                Medium
              </Badge>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Risk flags — live data wired in step 10.
        </p>
      </CardContent>
    </Card>
  );
}
