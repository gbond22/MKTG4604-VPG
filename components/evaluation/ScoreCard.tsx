import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/**
 * ScoreCard — placeholder shell.
 *
 * Will display:
 *   - Decision badge (ACCEPT / NEGOTIATE / DECLINE / NEED_MORE_INFO)
 *   - Composite score (1–100) with progress bar
 *   - Sub-score bars: fair_pay 35%, brand_risk 30%, fit 20%, terms_burden 15%
 *   - Fair market rate range
 *   - Confidence level
 *
 * TODO (step 10): accept EvaluationResult prop and render live data.
 */
export function ScoreCard() {
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
          {/* Decision badge — placeholder */}
          <Badge variant="outline" className="text-muted-foreground shrink-0">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Composite score */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Overall</span>
            <span className="text-2xl font-bold tabular-nums text-muted-foreground">
              —
            </span>
          </div>
          <Progress value={0} className="h-2" />
        </div>

        {/* Sub-scores */}
        <div className="space-y-3">
          {[
            { label: "Fair Pay", weight: "35%" },
            { label: "Brand Risk", weight: "30%" },
            { label: "Fit", weight: "20%" },
            { label: "Terms Burden", weight: "15%" },
          ].map(({ label, weight }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  {label}{" "}
                  <span className="font-medium text-muted-foreground/60">
                    {weight}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">—</span>
              </div>
              <Progress value={0} className="h-1" />
            </div>
          ))}
        </div>

        {/* Market range */}
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Fair market range: </span>
          <span className="font-medium text-muted-foreground">—</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Score card — live data wired in step 10.
        </p>
      </CardContent>
    </Card>
  );
}
