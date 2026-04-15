"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, FileText } from "lucide-react";

// ---------------------------------------------------------------------------
// Form-level schema
// Number fields: use z.number() + valueAsNumber in register() — not z.coerce
// engagement_rate_pct: user enters % (e.g. 3.5); divided by 100 before API call
// ---------------------------------------------------------------------------
const ProfileFormSchema = z.object({
  platform: z.enum(["instagram", "tiktok"], {
    error: "Scoring is currently available for Instagram and TikTok.",
  }),
  niche: z.enum(["beauty", "fitness", "lifestyle", "food", "consumer"]),
  followers: z
    .number({ error: "Enter a number." })
    .int("Must be a whole number.")
    .min(1000, "Minimum 1,000 followers.")
    .max(1_000_000, "Maximum 1,000,000 followers."),
  engagement_rate_pct: z
    .number({ error: "Enter a number." })
    .min(0, "Cannot be negative.")
    .max(100, "Cannot exceed 100%."),
  avg_views: z
    .number({ error: "Enter a number." })
    .int("Must be a whole number.")
    .min(0, "Cannot be negative."),
  geography: z
    .string()
    .min(2, "Enter a 2-letter country code (e.g. US).")
    .max(2, "Enter a 2-letter country code (e.g. US).")
    .toUpperCase(),
  handle: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

type FunctionalPlatform = "instagram" | "tiktok";
type DisplayPlatform =
  | FunctionalPlatform
  | "youtube"
  | "twitter"
  | "pinterest";

interface PlatformOption {
  value: DisplayPlatform;
  label: string;
  functional: boolean;
}

const PLATFORMS: PlatformOption[] = [
  { value: "instagram", label: "Instagram", functional: true },
  { value: "tiktok", label: "TikTok", functional: true },
  { value: "youtube", label: "YouTube", functional: false },
  { value: "twitter", label: "Twitter / X", functional: false },
  { value: "pinterest", label: "Pinterest", functional: false },
];

const NICHES: {
  value: "beauty" | "fitness" | "lifestyle" | "food" | "consumer";
  label: string;
}[] = [
  { value: "beauty", label: "Beauty" },
  { value: "fitness", label: "Fitness" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "food", label: "Food" },
  { value: "consumer", label: "Consumer Products" },
];

interface CreatorProfileFormProps {
  onSaved: (profileId: string) => void;
  savedProfileId: string | null;
}

export function CreatorProfileForm({
  onSaved,
  savedProfileId,
}: CreatorProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingPhase, setSavingPhase] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const SAVE_PHASES = ["Saving profile...", "Setting up benchmarks..."];

  // Tracks which pill is visually selected, including non-functional platforms
  const [displayPlatform, setDisplayPlatform] =
    useState<DisplayPlatform | null>(null);

  // Optional cosmetic fields — stored as audience_demographics JSON if filled
  const [contentStyle, setContentStyle] = useState("");
  const [previousBrands, setPreviousBrands] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
  });

  const selectedNiche = watch("niche");

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    try {
      const body: Record<string, unknown> = {
        platform: values.platform,
        niche: values.niche,
        followers: values.followers,
        engagement_rate: values.engagement_rate_pct / 100,
        avg_views: values.avg_views,
        geography: values.geography,
        handle: values.handle?.trim() || undefined,
      };

      // Cosmetic extras — silently included; stripped by API schema for MVP
      if (contentStyle.trim() || previousBrands.trim()) {
        body.audience_demographics = JSON.stringify({
          content_style: contentStyle.trim() || undefined,
          previous_brands: previousBrands.trim() || undefined,
        });
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.error ?? "Failed to save profile.");
        return;
      }

      const savedId = data.id as string;

      // Visual delay: step through phases, then navigate
      setSavingPhase(0);
      setSaving(true);
      let phase = 0;
      intervalRef.current = setInterval(() => {
        phase += 1;
        if (phase < SAVE_PHASES.length) {
          setSavingPhase(phase);
        } else {
          clearInterval(intervalRef.current!);
        }
      }, 1000);

      setTimeout(() => {
        onSaved(savedId);
      }, SAVE_PHASES.length * 1000);
    } catch {
      setServerError("Network error — please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* ── Card 1: Content & Niche ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#D4D0CA] bg-[#F5F0EB] p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B6D]/10 text-[#1B6B6D]">
            <Target className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1A1A2E]">
            Content &amp; Niche
          </h3>
        </div>

        <div className="space-y-6">
          {/* Platform pills */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-[#999999]">
              Platform
            </Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const active = displayPlatform === p.value;
                return (
                  <div key={p.value} className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDisplayPlatform(p.value);
                        if (p.functional) {
                          setValue(
                            "platform",
                            p.value as FunctionalPlatform,
                            { shouldValidate: true }
                          );
                        } else {
                          // Clear the form field so Zod validation fires on submit
                          setValue("platform", "" as FunctionalPlatform, {
                            shouldValidate: false,
                          });
                        }
                      }}
                      className={[
                        "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                        active && p.functional
                          ? "border-[#1B6B6D] bg-[#1B6B6D] text-white"
                          : active && !p.functional
                          ? "border-[#D4D0CA] bg-[#D4D0CA]/50 text-[#999999]"
                          : "border-[#D4D0CA] bg-white text-[#2D2D3F] hover:border-[#1B6B6D]/50",
                      ].join(" ")}
                    >
                      {p.label}
                    </button>
                    {active && !p.functional && (
                      <span className="text-[10px] font-medium text-[#999999]">
                        coming soon
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Hint shown immediately when a coming-soon platform is active */}
            {displayPlatform !== null &&
            !PLATFORMS.find((p) => p.value === displayPlatform)?.functional ? (
              <p className="text-xs text-[#999999]">
                Scoring is currently available for Instagram and TikTok.
              </p>
            ) : errors.platform ? (
              <p className="text-xs text-destructive">
                {errors.platform.message ?? "Select a platform."}
              </p>
            ) : null}
          </div>

          {/* Niche pills */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-[#999999]">
              Niche
            </Label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => {
                const active = selectedNiche === n.value;
                return (
                  <button
                    key={n.value}
                    type="button"
                    onClick={() =>
                      setValue("niche", n.value, { shouldValidate: true })
                    }
                    className={[
                      "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-[#1B6B6D] bg-[#1B6B6D] text-white"
                        : "border-[#D4D0CA] bg-white text-[#2D2D3F] hover:border-[#1B6B6D]/50",
                    ].join(" ")}
                  >
                    {n.label}
                  </button>
                );
              })}
            </div>
            {errors.niche && (
              <p className="text-xs text-destructive">
                {errors.niche.message ?? "Select a niche."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Card 2: Audience & Metrics ──────────────────────────────────── */}
      <div className="rounded-2xl border border-[#D4D0CA] bg-[#F5F0EB] p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B6D]/10 text-[#1B6B6D]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1A1A2E]">
            Audience &amp; Metrics
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Followers */}
          <div className="space-y-1.5">
            <Label
              htmlFor="followers"
              className="text-xs font-medium uppercase tracking-wide text-[#999999]"
            >
              Followers
            </Label>
            <Input
              id="followers"
              type="number"
              placeholder="e.g. 50000"
              min={1000}
              max={1000000}
              className="bg-white border-[#D4D0CA] rounded-lg"
              {...register("followers", { valueAsNumber: true })}
            />
            {errors.followers && (
              <p className="text-xs text-destructive">
                {errors.followers.message}
              </p>
            )}
          </div>

          {/* Engagement rate */}
          <div className="space-y-1.5">
            <Label
              htmlFor="engagement_rate_pct"
              className="text-xs font-medium uppercase tracking-wide text-[#999999]"
            >
              Engagement Rate{" "}
              <span className="normal-case font-normal text-[#999999]">
                (%)
              </span>
            </Label>
            <Input
              id="engagement_rate_pct"
              type="number"
              placeholder="e.g. 2.5"
              step="0.1"
              min={0}
              max={100}
              className="bg-white border-[#D4D0CA] rounded-lg"
              {...register("engagement_rate_pct", { valueAsNumber: true })}
            />
            {errors.engagement_rate_pct && (
              <p className="text-xs text-destructive">
                {errors.engagement_rate_pct.message}
              </p>
            )}
          </div>

          {/* Avg views */}
          <div className="space-y-1.5">
            <Label
              htmlFor="avg_views"
              className="text-xs font-medium uppercase tracking-wide text-[#999999]"
            >
              Avg. Views / Post
            </Label>
            <Input
              id="avg_views"
              type="number"
              placeholder="e.g. 12000"
              min={0}
              className="bg-white border-[#D4D0CA] rounded-lg"
              {...register("avg_views", { valueAsNumber: true })}
            />
            {errors.avg_views && (
              <p className="text-xs text-destructive">
                {errors.avg_views.message}
              </p>
            )}
          </div>

          {/* Geography */}
          <div className="space-y-1.5">
            <Label
              htmlFor="geography"
              className="text-xs font-medium uppercase tracking-wide text-[#999999]"
            >
              Primary Audience Country{" "}
              <span className="normal-case font-normal text-[#999999]">
                (ISO code)
              </span>
            </Label>
            <Input
              id="geography"
              type="text"
              placeholder="e.g. US, CA, GB"
              maxLength={2}
              className="uppercase bg-white border-[#D4D0CA] rounded-lg"
              {...register("geography")}
            />
            {errors.geography && (
              <p className="text-xs text-destructive">
                {errors.geography.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Card 3: Additional Context ──────────────────────────────────── */}
      <div className="rounded-2xl border border-[#D4D0CA] bg-[#F5F0EB] p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B6D]/10 text-[#1B6B6D]">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#1A1A2E]">
            Additional Context
          </h3>
        </div>

        <div className="space-y-6">
          {/* Handle */}
          <div className="space-y-1.5">
            <Label
              htmlFor="handle"
              className="text-xs font-medium uppercase tracking-wide text-[#999999]"
            >
              Handle{" "}
              <span className="normal-case font-normal text-[#999999]">
                (optional)
              </span>
            </Label>
            <Input
              id="handle"
              type="text"
              placeholder="e.g. yourhandle (no @ needed)"
              className="bg-white border-[#D4D0CA] rounded-lg"
              {...register("handle")}
            />
          </div>

          {/* Content style */}
          <div className="space-y-1.5">
            <Label
              htmlFor="content_style"
              className="text-xs font-medium uppercase tracking-wide text-[#999999]"
            >
              Content Style{" "}
              <span className="normal-case font-normal text-[#999999]">
                (optional)
              </span>
            </Label>
            <textarea
              id="content_style"
              rows={3}
              placeholder="Describe your content style, tone, and aesthetic..."
              value={contentStyle}
              onChange={(e) => setContentStyle(e.target.value)}
              className="w-full rounded-lg border border-[#D4D0CA] bg-white px-3 py-2 text-sm text-[#1A1A2E] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1B6B6D]/30 resize-none"
            />
          </div>

          {/* Previous brand partnerships */}
          <div className="space-y-1.5">
            <Label
              htmlFor="previous_brands"
              className="text-xs font-medium uppercase tracking-wide text-[#999999]"
            >
              Previous Brand Partnerships{" "}
              <span className="normal-case font-normal text-[#999999]">
                (optional)
              </span>
            </Label>
            <textarea
              id="previous_brands"
              rows={3}
              placeholder="List any notable brands you have worked with..."
              value={previousBrands}
              onChange={(e) => setPreviousBrands(e.target.value)}
              className="w-full rounded-lg border border-[#D4D0CA] bg-white px-3 py-2 text-sm text-[#1A1A2E] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1B6B6D]/30 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button
        type="submit"
        className="w-full hover:bg-[#155456]"
        disabled={saving}
      >
        {saving
          ? SAVE_PHASES[savingPhase]
          : savedProfileId
          ? "Update & Continue →"
          : "Continue to Evaluate →"}
      </Button>
    </form>
  );
}
