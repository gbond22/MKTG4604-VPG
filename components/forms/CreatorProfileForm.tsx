"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Form-level schema
// Number fields: use z.number() + valueAsNumber in register() — not z.coerce
// engagement_rate_pct: user enters % (e.g. 3.5); divided by 100 before API call
// ---------------------------------------------------------------------------
const ProfileFormSchema = z.object({
  platform: z.enum(["instagram", "tiktok"]),
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
  });

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: values.platform,
          niche: values.niche,
          followers: values.followers,
          engagement_rate: values.engagement_rate_pct / 100, // % → decimal
          avg_views: values.avg_views,
          geography: values.geography,
          handle: values.handle?.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.error ?? "Failed to save profile.");
        return;
      }

      setSaveSuccess(true);
      onSaved(data.id as string);
    } catch {
      setServerError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Creator Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Platform */}
            <div className="space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <Select
                onValueChange={(v) =>
                  setValue("platform", v as "instagram" | "tiktok", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-xs text-destructive">
                  {errors.platform.message ?? "Select a platform."}
                </p>
              )}
            </div>

            {/* Niche */}
            <div className="space-y-1.5">
              <Label htmlFor="niche">Niche</Label>
              <Select
                onValueChange={(v) =>
                  setValue(
                    "niche",
                    v as
                      | "beauty"
                      | "fitness"
                      | "lifestyle"
                      | "food"
                      | "consumer",
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger id="niche">
                  <SelectValue placeholder="Select niche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                </SelectContent>
              </Select>
              {errors.niche && (
                <p className="text-xs text-destructive">
                  {errors.niche.message ?? "Select a niche."}
                </p>
              )}
            </div>

            {/* Followers */}
            <div className="space-y-1.5">
              <Label htmlFor="followers">Followers</Label>
              <Input
                id="followers"
                type="number"
                placeholder="e.g. 45000"
                min={1000}
                max={1000000}
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
              <Label htmlFor="engagement_rate_pct">
                Engagement Rate{" "}
                <span className="font-normal text-muted-foreground">(%)</span>
              </Label>
              <Input
                id="engagement_rate_pct"
                type="number"
                placeholder="e.g. 3.5"
                step="0.1"
                min={0}
                max={100}
                {...register("engagement_rate_pct", { valueAsNumber: true })}
              />
              {errors.engagement_rate_pct && (
                <p className="text-xs text-destructive">
                  {errors.engagement_rate_pct.message}
                </p>
              )}
            </div>

            {/* Average views */}
            <div className="space-y-1.5">
              <Label htmlFor="avg_views">Avg. Views / Post</Label>
              <Input
                id="avg_views"
                type="number"
                placeholder="e.g. 12000"
                min={0}
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
              <Label htmlFor="geography">
                Primary Audience Country{" "}
                <span className="font-normal text-muted-foreground">
                  (ISO code)
                </span>
              </Label>
              <Input
                id="geography"
                type="text"
                placeholder="US"
                maxLength={2}
                className="uppercase"
                {...register("geography")}
              />
              {errors.geography && (
                <p className="text-xs text-destructive">
                  {errors.geography.message}
                </p>
              )}
            </div>

            {/* Handle */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="handle">
                Handle{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="handle"
                type="text"
                placeholder="yourhandle"
                {...register("handle")}
              />
            </div>
          </div>

          {/* Feedback */}
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          {saveSuccess && !serverError && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Profile saved. Scroll down to paste your offer.
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
            {saving
              ? "Saving…"
              : savedProfileId
              ? "Update Profile"
              : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
