"use client";

import { useState } from "react";
import { CreatorProfileForm } from "@/components/forms/CreatorProfileForm";
import { OfferInputForm } from "@/components/forms/OfferInputForm";
import { ScoreCard } from "@/components/evaluation/ScoreCard";
import { RiskFlags } from "@/components/evaluation/RiskFlags";
import { FitSummary } from "@/components/evaluation/FitSummary";
import { NegotiationPoints } from "@/components/evaluation/NegotiationPoints";
import { FollowUpChat } from "@/components/chat/FollowUpChat";
import { Separator } from "@/components/ui/separator";
import type { EvaluationResult } from "@/lib/validation/schemas";

export function EvaluateClient() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [parserUsed, setParserUsed] = useState<"ollama" | "mock" | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            Brand Deal Evaluator
          </h1>
          <span className="text-sm text-muted-foreground">
            Paste an offer. Get a score.
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-10">
        {/* ── Step 1: Creator Profile ── */}
        <section aria-labelledby="profile-heading">
          <div className="mb-4">
            <h2
              id="profile-heading"
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              Step 1 — Your Profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us about your audience so we can look up accurate rate
              benchmarks.
            </p>
          </div>
          <CreatorProfileForm onSaved={setProfileId} savedProfileId={profileId} />
        </section>

        <Separator />

        {/* ── Step 2: Offer Input ── */}
        <section aria-labelledby="offer-heading">
          <div className="mb-4">
            <h2
              id="offer-heading"
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              Step 2 — Paste the Offer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Copy the full DM, email, or brief and paste it below.
            </p>
          </div>
          <OfferInputForm
            profileId={profileId}
            onEvaluated={(result, evalId, pu) => {
              setEvaluationResult(result);
              setEvaluationId(evalId);
              setParserUsed(pu);
            }}
          />
        </section>

        <Separator />

        {/* ── Step 3: Evaluation Results ── */}
        <section aria-labelledby="results-heading">
          <div className="mb-4">
            <h2
              id="results-heading"
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              Step 3 — Evaluation
            </h2>
          </div>

          {parserUsed === "mock" && (
            <div
              role="alert"
              className="mb-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <span className="mt-0.5 shrink-0 text-amber-500" aria-hidden>
                ⚠
              </span>
              <span>
                <strong>Ollama is not running</strong> — evaluation is based on
                sample data, not your actual offer. Start Ollama and re-submit
                for accurate results.
              </span>
            </div>
          )}

          <ScoreCard result={evaluationResult} />

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <RiskFlags result={evaluationResult} />
            <FitSummary result={evaluationResult} />
          </div>

          <div className="mt-6">
            <NegotiationPoints result={evaluationResult} />
          </div>
        </section>

        <Separator />

        {/* ── Step 4: Follow-up Chat ── */}
        <section aria-labelledby="chat-heading">
          <div className="mb-4">
            <h2
              id="chat-heading"
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              Step 4 — Ask a Follow-up
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask anything about this offer. Answers are grounded in the
              evaluation above.
            </p>
          </div>
          <FollowUpChat evaluationId={evaluationId} />
        </section>
      </main>
    </div>
  );
}
