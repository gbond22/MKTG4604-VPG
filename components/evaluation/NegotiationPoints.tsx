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
    badgeClassName: "border-[#C4613A]/30 bg-[#C4613A]/15 text-[#C4613A]",
    order: 0,
  },
  nice_to_have: {
    label: "Nice to Have",
    badgeClassName: "border-[#D4A84B]/30 bg-[#D4A84B]/15 text-[#D4A84B]",
    order: 1,
  },
  informational: {
    label: "Informational",
    badgeClassName: "border-[#1B6B6D]/30 bg-[#1B6B6D]/15 text-[#1B6B6D]",
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
    <Card className="rounded-2xl shadow-sm border-[#D4D0CA] bg-[#F5F0EB]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base text-[#1A1A2E]">Negotiation Points</CardTitle>
            <CardDescription className="mt-0.5 text-[#999999]">
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
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[#D4D0CA] bg-[#EDE7DF]/50">
            <p className="text-sm text-[#999999]">No evaluation yet.</p>
          </div>
        ) : points.length === 0 ? (
          <div className="rounded-xl border border-[#D4D0CA] bg-[#EDE7DF]/50 px-4 py-6 text-center">
            <p className="text-sm text-[#999999]">
              No negotiation points were generated for this offer.
            </p>
          </div>
        ) : (
          <Accordion multiple className="w-full">
            {points.map((point, index) => {
              const priority = PRIORITY_META[point.priority];

              return (
                <AccordionItem
                  key={`${point.priority}-${index}`}
                  value={`${point.priority}-${index}`}
                >
                  <AccordionTrigger className="text-left">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pr-4">
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", priority.badgeClassName)}
                      >
                        {priority.label}
                      </Badge>
                      <span className="min-w-0 text-sm font-medium leading-6 text-[#2D2D3F]">
                        {point.topic}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-4 text-sm">
                    <div className="rounded-md border border-[#D4D0CA] bg-[#EDE7DF]/50 px-3 py-2">
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-[#999999]">
                        Suggested ask
                      </p>
                      <p className="leading-relaxed text-[#2D2D3F]">{point.suggested_ask}</p>
                    </div>
                    {point.rationale && (
                      <p className="text-xs text-[#999999]">
                        {point.rationale}
                      </p>
                    )}
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
