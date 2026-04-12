import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * FitSummary — placeholder shell.
 *
 * Will display:
 *   - Plain-English fit explanation (LLM-generated, grounded in retrieved facts)
 *   - Evidence notes (source citations)
 *   - Missing-info warnings
 *
 * TODO (step 10): accept fit_summary, evidence_notes, missing_info_warnings props.
 */
export function FitSummary() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Brand &amp; Audience Fit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[80px] items-center justify-center rounded-md border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No evaluation yet.</p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Fit summary — live data wired in step 10.
        </p>
      </CardContent>
    </Card>
  );
}
