import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { EvaluationResult } from "@/lib/validation/schemas";

const PRIORITY_VARIANT = {
  must_have: "destructive",
  nice_to_have: "secondary",
  informational: "outline",
} as const satisfies Record<string, "destructive" | "secondary" | "outline">;

const PRIORITY_LABEL = {
  must_have: "Must-have",
  nice_to_have: "Nice to have",
  informational: "FYI",
};

interface NegotiationPointsProps {
  result: EvaluationResult | null;
}

export function NegotiationPoints({ result }: NegotiationPointsProps) {
  const points = result?.negotiation_points ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Negotiation Points</CardTitle>
            <CardDescription className="mt-0.5">
              Ordered by priority. Expand each point for the suggested ask.
            </CardDescription>
          </div>
          {result && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {points.length} {points.length === 1 ? "point" : "points"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-md border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No evaluation yet.</p>
          </div>
        ) : points.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No negotiation points generated.
          </p>
        ) : (
          <Accordion multiple className="w-full">
            {points.map((point, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2 text-left">
                    <Badge
                      variant={PRIORITY_VARIANT[point.priority]}
                      className="shrink-0 text-xs"
                    >
                      {PRIORITY_LABEL[point.priority]}
                    </Badge>
                    <span>{point.topic}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  <p className="font-medium">Suggested ask:</p>
                  <p className="text-muted-foreground">{point.suggested_ask}</p>
                  {point.rationale && (
                    <p className="text-xs text-muted-foreground/80">
                      {point.rationale}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
