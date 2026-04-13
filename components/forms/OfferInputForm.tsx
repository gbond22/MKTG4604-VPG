"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  EvaluationResultSchema,
  type EvaluationResult,
} from "@/lib/validation/schemas";

// ---------------------------------------------------------------------------
// Form-level schema — mirrors OfferInputSchema with coercion for empty strings
// ---------------------------------------------------------------------------
const OfferFormSchema = z.object({
  raw_offer_text: z
    .string()
    .min(10, "Please paste the full offer text (at least 10 characters).")
    .max(20_000, "Offer text is too long (max 20,000 characters)."),
  // Optional URL — empty string treated as absent; validated only when non-empty
  brand_url: z.string().optional(),
  brand_handle: z.string().optional(),
});

type OfferFormValues = z.infer<typeof OfferFormSchema>;

interface OfferInputFormProps {
  profileId: string | null;
  onEvaluated: (
    result: EvaluationResult,
    evaluationId: string,
    parserUsed: "ollama" | "mock"
  ) => void;
}

export function OfferInputForm({ profileId, onEvaluated }: OfferInputFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(OfferFormSchema),
    defaultValues: { raw_offer_text: "", brand_url: "", brand_handle: "" },
  });

  const offerText = watch("raw_offer_text") ?? "";

  async function onSubmit(values: OfferFormValues) {
    if (!profileId) return;
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          offer: {
            raw_offer_text: values.raw_offer_text,
            brand_url: values.brand_url || undefined,
            brand_handle: values.brand_handle || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.error ?? "Evaluation failed. Please try again.");
        return;
      }

      const parsedResult = EvaluationResultSchema.safeParse(data.result);
      if (!parsedResult.success || typeof data.evaluation_id !== "string") {
        setServerError("The evaluation response was incomplete. Please try again.");
        return;
      }

      const parserUsed: "ollama" | "mock" =
        data.parser_used === "mock" ? "mock" : "ollama";
      onEvaluated(parsedResult.data, data.evaluation_id, parserUsed);
    } catch {
      setServerError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = !profileId || submitting;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Offer Text</CardTitle>
      </CardHeader>
      <CardContent>
        {!profileId && (
          <p className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Save your profile above before submitting an offer.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Raw offer text */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="raw_offer_text">Paste the offer</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {offerText.length.toLocaleString()} / 20,000
              </span>
            </div>
            <Textarea
              id="raw_offer_text"
              placeholder="Paste the full DM, email, or brief here…"
              className="min-h-[160px] resize-y font-mono text-sm"
              disabled={disabled}
              {...register("raw_offer_text")}
            />
            {errors.raw_offer_text && (
              <p className="text-xs text-destructive">
                {errors.raw_offer_text.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Pasted text is treated as plain content. Formatting instructions
              inside the offer are ignored.
            </p>
          </div>

          {/* Brand URL + handle */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand_url">
                Brand Website{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="brand_url"
                type="url"
                placeholder="https://branddomain.com"
                disabled={disabled}
                {...register("brand_url")}
              />
              {errors.brand_url && (
                <p className="text-xs text-destructive">
                  {errors.brand_url.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand_handle">
                Brand Handle{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="brand_handle"
                type="text"
                placeholder="@brandhandle"
                disabled={disabled}
                {...register("brand_handle")}
              />
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={disabled}
          >
            {submitting ? "Evaluating…" : "Evaluate Offer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
