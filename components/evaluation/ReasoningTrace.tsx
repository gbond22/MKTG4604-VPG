"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { EvaluationResult } from "@/lib/validation/schemas";

interface ReasoningTraceProps {
  result: EvaluationResult;
}

const DECISION_LABEL: Record<string, string> = {
  ACCEPT: "Accept",
  NEGOTIATE: "Negotiate",
  DECLINE: "Decline",
  NEED_MORE_INFO: "Need More Info",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ReasoningTrace({ result }: ReasoningTraceProps) {
  const [open, setOpen] = useState(false);

  const offerNotes = result.evidence_notes?.filter((n) => n.source === "offer") ?? [];
  const benchmarkNotes = result.evidence_notes?.filter((n) => n.source === "benchmark") ?? [];
  const brandNotes = result.evidence_notes?.filter((n) => n.source === "brand_signal") ?? [];
  const criticalFlags = result.risk_flags.filter((f) => f.severity === "critical");
  const sub = result.subscore_breakdown;

  const steps: { title: string; body: React.ReactNode }[] = [
    {
      title: "Parsed offer",
      body: offerNotes.length > 0 ? (
        <ul className="space-y-0.5">
          {offerNotes.map((n, i) => (
            <li key={i} className="text-sm text-[#2D2D3F]">{n.note}</li>
          ))}
        </ul>
      ) : result.missing_info_warnings.length > 0 ? (
        <div>
          <p className="text-sm text-[#999999] mb-1">Missing info detected:</p>
          <ul className="space-y-0.5">
            {result.missing_info_warnings.map((w, i) => (
              <li key={i} className="text-sm text-[#D4A84B]">{w}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-[#999999]">Offer text extracted successfully.</p>
      ),
    },
    {
      title: "Benchmark lookup",
      body: benchmarkNotes.length > 0 ? (
        <ul className="space-y-0.5">
          {benchmarkNotes.map((n, i) => (
            <li key={i} className="text-sm text-[#2D2D3F]">{n.note}</li>
          ))}
        </ul>
      ) : result.fair_market_range ? (
        <p className="text-sm text-[#2D2D3F]">
          Fair market range: {fmt(result.fair_market_range.low)}–{fmt(result.fair_market_range.high)}
          {result.fair_market_range.basis ? ` · ${result.fair_market_range.basis}` : ""}
        </p>
      ) : (
        <p className="text-sm text-[#999999]">No benchmark data matched this profile.</p>
      ),
    },
    {
      title: "Brand signal check",
      body: brandNotes.length > 0 ? (
        <ul className="space-y-0.5">
          {brandNotes.map((n, i) => (
            <li key={i} className="text-sm text-[#2D2D3F]">{n.note}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#999999]">No brand signal data available.</p>
      ),
    },
    {
      title: "Hard-stop rules",
      body: criticalFlags.length > 0 ? (
        <ul className="space-y-1">
          {criticalFlags.map((f, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium text-[#C4613A]">Critical — </span>
              <span className="text-[#2D2D3F]">{f.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#999999]">No hard-stop rules triggered.</p>
      ),
    },
    {
      title: "Subscores",
      body: sub ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {(
            [
              ["Fair Pay", sub.fair_pay, "40%"],
              ["Brand Risk", sub.brand_risk, "25%"],
              ["Fit", sub.fit, "20%"],
              ["Terms Burden", sub.terms_burden, "15%"],
            ] as [string, number, string][]
          ).map(([label, value, weight]) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-sm text-[#999999]">
                {label} <span className="text-xs">({weight})</span>
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color: value >= 70 ? "#1B6B6D" : value >= 50 ? "#a07a00" : "#C4613A",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#999999]">Subscores not available.</p>
      ),
    },
    {
      title: "Final decision",
      body: (
        <p className="text-sm text-[#2D2D3F]">
          <span className="font-semibold">{DECISION_LABEL[result.decision_status] ?? result.decision_status}</span>
          {result.composite_score !== null && (
            <> · Score {result.composite_score}/100</>
          )}
          <> · Confidence {result.confidence_level}</>
        </p>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-[#D4D0CA] bg-[#F5F0EB]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-[#1A1A2E]">
          How we evaluated this
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#1B6B6D]">
          {open ? "Hide reasoning trace" : "Show reasoning trace"}
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#D4D0CA]" aria-hidden="true" />

            <ol className="space-y-5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  {/* Step dot */}
                  <div className="relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-[#1B6B6D] bg-[#F5F0EB] mt-0.5">
                    <span className="text-[9px] font-bold text-[#1B6B6D]">{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#555555]">
                      {step.title}
                    </p>
                    {step.body}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
