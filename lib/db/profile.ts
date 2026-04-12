import { prisma } from "@/lib/prisma";
import type { CreatorProfileInput } from "@/lib/validation/schemas";

/** Create a new CreatorProfile row. Returns the saved record. */
export async function createProfile(input: CreatorProfileInput) {
  return prisma.creatorProfile.create({
    data: {
      platform: input.platform,
      niche: input.niche,
      followers: input.followers,
      engagement_rate: input.engagement_rate,
      avg_views: input.avg_views,
      geography: input.geography,
      handle: input.handle ?? null,
      profile_url: input.profile_url ?? null,
      competitor_restrictions: input.competitor_restrictions
        ? JSON.stringify(input.competitor_restrictions)
        : null,
    },
  });
}

/** Fetch a CreatorProfile by id. Returns null if not found. */
export async function getProfileById(id: string) {
  return prisma.creatorProfile.findUnique({ where: { id } });
}
