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

/**
 * NegotiationPoints — placeholder shell.
 *
 * Will display an Accordion of NegotiationPoint objects, each with:
 *   - Priority badge (must_have / nice_to_have / informational)
 *   - Topic heading
 *   - Suggested ask text
 *   - Optional rationale
 *
 * TODO (step 10): accept negotiation_points: NegotiationPoint[] prop.
 */
export function NegotiationPoints() {
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
          <Badge variant="secondary" className="shrink-0 text-xs">
            0 points
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion multiple className="w-full">
          {/* Placeholder item to show structure */}
          <AccordionItem value="placeholder" className="opacity-30 pointer-events-none">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  Must-have
                </Badge>
                <span>Usage rights scope</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Ask for organic-only usage rights or a higher flat fee for paid
              amplification rights.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <p className="mt-3 text-xs text-muted-foreground">
          Negotiation points — live data wired in step 10.
        </p>
      </CardContent>
    </Card>
  );
}
