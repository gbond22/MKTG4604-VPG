import type { Metadata } from "next";
import Link from "next/link";
import { EvaluateShell } from "@/components/layout/EvaluateShell";
import { SlideViewer } from "@/components/SlideViewer";

export const metadata: Metadata = {
  title: "About — Brandalyze",
};

export default function AboutPage() {
  return (
    <EvaluateShell>
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <div className="rounded-2xl border border-[#D4D0CA] bg-[#F5F0EB] p-10">
          <h1 className="text-2xl font-bold text-[#1A1A2E]">About Brandalyze</h1>
          <p className="mt-5 text-sm leading-7 text-[#2D2D3F]">
            Brandalyze is an AI-powered deal evaluation tool built for independent
            content creators. We help creators make confident, data-driven
            partnership decisions — no agent required.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#2D2D3F]">
            Paste any brand offer — a DM, email, or brief — and Brandalyze
            scores it across fair pay, brand legitimacy, audience fit, and
            contract terms. Every score is computed deterministically from
            real benchmark data, so you always know where you stand.
          </p>
          <div className="mt-8 border-t border-[#D4D0CA] pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-[#1B6B6D] hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Presentation slides */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[#1A1A2E]">Presentation</h2>
          <SlideViewer totalSlides={10} />
        </div>
      </main>
    </EvaluateShell>
  );
}
