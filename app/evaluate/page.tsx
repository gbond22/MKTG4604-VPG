import { CreatorProfileForm } from "@/components/forms/CreatorProfileForm";
import { OfferInputForm } from "@/components/forms/OfferInputForm";
import { ScoreCard } from "@/components/evaluation/ScoreCard";
import { RiskFlags } from "@/components/evaluation/RiskFlags";
import { FitSummary } from "@/components/evaluation/FitSummary";
import { NegotiationPoints } from "@/components/evaluation/NegotiationPoints";
import { FollowUpChat } from "@/components/chat/FollowUpChat";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Evaluate Offer — Brand Deal Evaluator",
};

export default function EvaluatePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Brand Deal Evaluator</h1>
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
              Tell us about your audience so we can look up accurate rate benchmarks.
            </p>
          </div>
          <CreatorProfileForm />
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
          <OfferInputForm />
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

          {/* Score card spans full width */}
          <ScoreCard />

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <RiskFlags />
            <FitSummary />
          </div>

          <div className="mt-6">
            <NegotiationPoints />
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
              Ask anything about this offer. Answers are grounded in the evaluation above.
            </p>
          </div>
          <FollowUpChat />
        </section>
      </main>
    </div>
  );
}
