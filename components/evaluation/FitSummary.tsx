import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvaluationResult } from "@/lib/validation/schemas";

interface FitSummaryProps {
  result: EvaluationResult | null;
}

export function FitSummary({ result }: FitSummaryProps) {
  const summary = result?.fit_summary ?? null;
  const notes = result?.evidence_notes ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Brand &amp; Audience Fit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!result ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-md border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No evaluation yet.</p>
          </div>
        ) : (
          <>
            {summary ? (
              <p className="text-sm leading-relaxed">{summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Fit analysis unavailable — offer may be missing required fields.
              </p>
            )}

            {notes.length > 0 && (
              <ul className="space-y-1 border-t border-border pt-3">
                {notes.map((note, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    <span className="font-medium capitalize">{note.source}</span>
                    : {note.note}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
