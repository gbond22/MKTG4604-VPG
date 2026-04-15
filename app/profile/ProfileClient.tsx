"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { CreatorProfileForm } from "@/components/forms/CreatorProfileForm";
import { useState } from "react";

export function ProfileClient() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);

  function handleSaved(id: string) {
    setProfileId(id);
    router.push(`/evaluate?profileId=${id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B6D]/10 text-[#1B6B6D]">
          <User className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A2E] uppercase tracking-widest">
            Step 1 — Your Profile
          </h2>
          <p className="text-xs text-[#999999] mt-0.5">
            Tell us about your audience
          </p>
        </div>
      </div>

      <CreatorProfileForm onSaved={handleSaved} savedProfileId={profileId} />
    </main>
  );
}
