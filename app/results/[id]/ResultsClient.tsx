"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { ScoreCard } from "@/components/evaluation/ScoreCard";
import { RiskFlags } from "@/components/evaluation/RiskFlags";
import { FitSummary } from "@/components/evaluation/FitSummary";
import { NegotiationPoints } from "@/components/evaluation/NegotiationPoints";
import { FollowUpChat } from "@/components/chat/FollowUpChat";
import { ExportSummary } from "@/components/evaluation/ExportSummary";
import { Button } from "@/components/ui/button";
import type { EvaluationResult } from "@/lib/validation/schemas";
import type { ProfileSummary, BrandSummary } from "@/lib/db/evaluation";

interface ResultsClientProps {
  evaluationId: string;
  result: EvaluationResult;
  profileId: string;
  profile: ProfileSummary;
  brand: BrandSummary;
  evaluationDate: string;
}

export function ResultsClient({
  evaluationId,
  result,
  profileId,
  profile,
  brand,
  evaluationDate,
}: ResultsClientProps) {
  const evaluateHref = `/evaluate?profileId=${profileId}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      {/* Top navigation row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={evaluateHref}
          className="inline-flex items-center gap-1 text-sm text-[#1B6B6D] hover:underline"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <ExportSummary
            result={result}
            profile={profile}
            brand={brand}
            evaluationDate={evaluationDate}
          />
          <Link href={evaluateHref}>
            <Button className="hover:bg-[#155456]">
              Evaluate Another Offer →
            </Button>
          </Link>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B6D]/10 text-[#1B6B6D]">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A2E] uppercase tracking-widest">
            Step 3 — Evaluation
          </h2>
          <p className="text-xs text-[#999999] mt-0.5">
            Score, risk flags, and market benchmarks
          </p>
        </div>
      </div>

      {/* Results grid */}
      <ScoreCard result={result} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RiskFlags result={result} />
        <FitSummary result={result} />
      </div>

      <NegotiationPoints result={result} />

      {/* Follow-up chat */}
      <div className="pt-4 border-t border-[#D4D0CA]">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B6D]/10 text-[#1B6B6D]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1A1A2E] uppercase tracking-widest">
              Ask a Follow-up
            </h2>
            <p className="text-xs text-[#999999] mt-0.5">
              Answers are grounded in the evaluation above
            </p>
          </div>
        </div>
        <FollowUpChat evaluationId={evaluationId} />
      </div>
    </main>
  );
}
