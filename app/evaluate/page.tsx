import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EvaluateShell } from "@/components/layout/EvaluateShell";
import { EvaluateClient } from "./EvaluateClient";

export const metadata: Metadata = {
  title: "Paste Offer — Brandalyze",
};

export default async function EvaluatePage({
  searchParams,
}: {
  searchParams: Promise<{ profileId?: string }>;
}) {
  const { profileId } = await searchParams;

  if (!profileId) {
    redirect("/profile");
  }

  return (
    <EvaluateShell>
      <EvaluateClient profileId={profileId} />
    </EvaluateShell>
  );
}
