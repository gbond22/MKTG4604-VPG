"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * FollowUpChat — placeholder shell.
 *
 * Will display:
 *   - Scrollable message thread (user question + system response pairs)
 *   - Textarea input + Send button
 *   - Disabled state when no evaluation_id is in context
 *
 * TODO (step 11): accept evaluationId prop, POST to /api/follow-up,
 *                append Q&A pairs to local message list.
 */
export function FollowUpChat() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Follow-up Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message thread area */}
        <div
          className="flex min-h-[120px] flex-col gap-3 rounded-md border border-dashed border-border p-3"
          aria-label="Chat thread"
        >
          <p className="text-sm text-muted-foreground">
            Complete an evaluation first to unlock follow-up questions.
          </p>

          {/* Example message bubbles — placeholder only */}
          <div className="space-y-3 opacity-30 pointer-events-none">
            <div className="ml-auto max-w-xs rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              Is this rate fair for my audience size?
            </div>
            <div className="mr-auto max-w-sm rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
              Based on the benchmark data for your tier and niche, the offered
              rate is below the 25th percentile…
            </div>
          </div>
        </div>

        <Separator />

        {/* Input row */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask anything about this offer…"
            className="min-h-[60px] flex-1 resize-none text-sm"
            disabled
          />
          <Button className="self-end" disabled>
            Send
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Follow-up chat — wired in step 11.
        </p>
      </CardContent>
    </Card>
  );
}
