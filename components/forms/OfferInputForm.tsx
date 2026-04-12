"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * OfferInputForm — placeholder shell.
 *
 * Collects: raw_offer_text (required), optional brand_url, optional brand_handle.
 *
 * TODO (step 6): wire up react-hook-form + OfferInputSchema,
 *               POST to /api/evaluate, surface result to parent page state.
 */
export function OfferInputForm() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Offer Text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Raw offer text */}
        <div className="space-y-1.5">
          <Label htmlFor="raw_offer_text">Paste the offer</Label>
          <Textarea
            id="raw_offer_text"
            placeholder="Paste the full DM, email, or brief here…"
            className="min-h-[160px] resize-y font-mono text-sm"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Treated as plain text. Formatting instructions inside will be ignored.
          </p>
        </div>

        {/* Brand URL */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="brand_url">
              Brand Website{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="brand_url"
              type="url"
              placeholder="https://branddomain.com"
              disabled
            />
          </div>

          {/* Brand handle */}
          <div className="space-y-1.5">
            <Label htmlFor="brand_handle">
              Brand Handle{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="brand_handle"
              type="text"
              placeholder="@brandhandle"
              disabled
            />
          </div>
        </div>

        <Button className="w-full" disabled>
          Evaluate Offer
        </Button>

        <p className="text-xs text-muted-foreground">
          Offer form — coming in step 6.
        </p>
      </CardContent>
    </Card>
  );
}
