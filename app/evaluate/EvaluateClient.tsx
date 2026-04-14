"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { OfferInputForm } from "@/components/forms/OfferInputForm";
import type { EvaluationResult } from "@/lib/validation/schemas";

interface EvaluateClientProps {
  profileId: string;
}

export function EvaluateClient({ profileId }: EvaluateClientProps) {
  const router = useRouter();

  function handleEvaluated(
    _result: EvaluationResult,
    evaluationId: string,
    _parserUsed: "ollama" | "mock"
  ) {
    router.push(`/results/${evaluationId}?profileId=${profileId}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
      {/* Back link */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-[#1B6B6D] hover:underline"
      >
        ← Back to Profile
      </Link>

      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B6D]/10 text-[#1B6B6D]">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A2E] uppercase tracking-widest">
            Step 2 — Paste the Offer
          </h2>
          <p className="text-xs text-[#999999] mt-0.5">
            Copy the full DM, email, or brief and paste it below
          </p>
        </div>
      </div>

      <OfferInputForm profileId={profileId} onEvaluated={handleEvaluated} />
    </main>
  );
}
