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
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/validation/schemas";

const PRIORITY_META = {
  must_have: {
    label: "Must Have",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    order: 0,
  },
  high: {
    label: "High",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    order: 0,
  },
  nice_to_have: {
    label: "Nice to Have",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    order: 1,
  },
  medium: {
    label: "Medium",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    order: 1,
  },
  informational: {
    label: "Informational",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
    order: 2,
  },
  low: {
    label: "Low",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
    order: 2,
  },
} as const;

interface NegotiationPointsProps {
  result: EvaluationResult | null;
}

export function NegotiationPoints({ result }: NegotiationPointsProps) {
  const points = [...(result?.negotiation_points ?? [])].sort(
    (a, b) => PRIORITY_META[a.priority].order - PRIORITY_META[b.priority].order
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Negotiation Points</CardTitle>
            <CardDescription className="mt-0.5">
              Prioritized talking points for your reply or contract negotiation.
            </CardDescription>
          </div>
          {result && (
            <Badge variant="outline" className="shrink-0">
              {points.length} {points.length === 1 ? "point" : "points"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">No evaluation yet.</p>
          </div>
        ) : points.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No negotiation points were generated for this offer.
            </p>
          </div>
        ) : (
          <Accordion multiple className="w-full">
            {points.map((point, index) => {
              const priority = PRIORITY_META[point.priority];

              return (
                <AccordionItem
                  key={`${point.category}-${index}`}
                  value={`${point.category}-${index}`}
                >
                  <AccordionTrigger className="text-left">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pr-4">
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", priority.badgeClassName)}
                      >
                        {priority.label}
                      </Badge>
                      <Badge variant="outline" className="shrink-0">
                        {point.category}
                      </Badge>
                      <span className="min-w-0 text-sm font-medium leading-6">
                        {point.point}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Use this ask when negotiating {point.category.toLowerCase()}.
                    </p>
                    <p className="leading-6">{point.point}</p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
