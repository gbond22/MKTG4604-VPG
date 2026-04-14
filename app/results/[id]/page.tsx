import type { Metadata } from "next";
import Link from "next/link";
import { EvaluateShell } from "@/components/layout/EvaluateShell";
import { ResultsClient } from "./ResultsClient";
import { getEvaluationById } from "@/lib/db/evaluation";

export const metadata: Metadata = {
  title: "Evaluation Results — Brandalyze",
};

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ profileId?: string; parserUsed?: string }>;
}) {
  const { id } = await params;
  const { profileId, parserUsed } = await searchParams;

  const record = await getEvaluationById(id);

  if (!record) {
    return (
      <EvaluateShell>
        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#D4D0CA] bg-[#F5F0EB] px-8 py-16 text-center">
            <p className="text-lg font-semibold text-[#1A1A2E]">
              No evaluation found
            </p>
            <p className="text-sm text-[#999999]">
              This evaluation ID doesn&apos;t exist or the results couldn&apos;t
              be loaded.
            </p>
            <Link
              href={profileId ? `/evaluate?profileId=${profileId}` : "/profile"}
              className="text-sm text-[#1B6B6D] hover:underline"
            >
              ← Evaluate an offer
            </Link>
          </div>
        </main>
      </EvaluateShell>
    );
  }

  const resolvedProfileId = profileId ?? record.profile_id;

  return (
    <EvaluateShell>
      <ResultsClient
        evaluationId={record.id}
        result={record.result}
        profileId={resolvedProfileId}
        profile={record.profile}
        brand={record.brand}
        evaluationDate={record.createdAt.toISOString()}
        parserUsed={parserUsed === "ollama" || parserUsed === "mock" ? parserUsed : undefined}
      />
    </EvaluateShell>
  );
}
