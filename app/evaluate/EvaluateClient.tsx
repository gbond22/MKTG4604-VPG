"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OfferInputForm } from "@/components/forms/OfferInputForm";
import type { EvaluationResult } from "@/lib/validation/schemas";

interface EvaluateClientProps {
  profileId: string;
}

const PHASES = [
  "Parsing offer...",
  "Looking up benchmarks...",
  "Computing score...",
];

const PHASE_DURATION_MS = 1000;
const TOTAL_DELAY_MS = PHASES.length * PHASE_DURATION_MS;

export function EvaluateClient({ profileId }: EvaluateClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleEvaluated(
    _result: EvaluationResult,
    evaluationId: string,
    parserUsed: "ollama" | "mock"
  ) {
    setPhaseIndex(0);
    setLoading(true);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx += 1;
      if (idx < PHASES.length) {
        setPhaseIndex(idx);
      } else {
        clearInterval(intervalRef.current!);
      }
    }, PHASE_DURATION_MS);

    timeoutRef.current = setTimeout(() => {
      router.push(
        `/results/${evaluationId}?profileId=${profileId}&parserUsed=${parserUsed}`
      );
    }, TOTAL_DELAY_MS);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col items-center justify-center gap-8 rounded-2xl border border-[#D4D0CA] bg-[#F5F0EB] px-8 py-20">
          {/* Animated spinner */}
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#D4D0CA] border-t-[#1B6B6D]" />
            <div className="h-6 w-6 rounded-full bg-[#1B6B6D]/10" />
          </div>

          {/* Phase text */}
          <div className="text-center space-y-2">
            <p className="text-base font-semibold text-[#1A1A2E] transition-all duration-300">
              {PHASES[phaseIndex]}
            </p>
            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {PHASES.map((_, i) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all duration-500",
                    i <= phaseIndex
                      ? "w-6 bg-[#1B6B6D]"
                      : "w-1.5 bg-[#D4D0CA]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
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
