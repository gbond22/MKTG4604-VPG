import type { Metadata } from "next";
import { EvaluateShell } from "@/components/layout/EvaluateShell";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = {
  title: "Your Profile — Brand Deal Evaluator",
};

export default function ProfilePage() {
  return (
    <EvaluateShell>
      <ProfileClient />
    </EvaluateShell>
  );
}
