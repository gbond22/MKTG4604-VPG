"use client";

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

/**
 * CreatorProfileForm — placeholder shell.
 *
 * Collects: platform, niche, followers, engagement_rate, avg_views,
 * geography, optional handle, optional competitor_restrictions.
 *
 * TODO (step 5): wire up react-hook-form + CreatorProfileInputSchema,
 *               persist to /api/profile, surface validation errors.
 */
export function CreatorProfileForm() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Creator Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Platform */}
          <div className="space-y-1.5">
            <Label htmlFor="platform">Platform</Label>
            <Select disabled>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Niche */}
          <div className="space-y-1.5">
            <Label htmlFor="niche">Niche</Label>
            <Select disabled>
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
              disabled
            />
          </div>

          {/* Engagement rate */}
          <div className="space-y-1.5">
            <Label htmlFor="engagement_rate">
              Engagement Rate{" "}
              <span className="text-muted-foreground font-normal">(%)</span>
            </Label>
            <Input
              id="engagement_rate"
              type="number"
              placeholder="e.g. 3.5"
              step="0.1"
              min={0}
              max={100}
              disabled
            />
          </div>

          {/* Average views */}
          <div className="space-y-1.5">
            <Label htmlFor="avg_views">Avg. Views / Post</Label>
            <Input
              id="avg_views"
              type="number"
              placeholder="e.g. 12000"
              min={0}
              disabled
            />
          </div>

          {/* Geography */}
          <div className="space-y-1.5">
            <Label htmlFor="geography">
              Primary Audience Country{" "}
              <span className="text-muted-foreground font-normal">(ISO code)</span>
            </Label>
            <Input
              id="geography"
              type="text"
              placeholder="US"
              maxLength={2}
              disabled
            />
          </div>

          {/* Handle */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="handle">
              Handle{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="handle"
              type="text"
              placeholder="@yourhandle"
              disabled
            />
          </div>
        </div>

        <Button className="w-full sm:w-auto" disabled>
          Save Profile
        </Button>

        <p className="text-xs text-muted-foreground">
          Profile form — coming in step 5.
        </p>
      </CardContent>
    </Card>
  );
}
