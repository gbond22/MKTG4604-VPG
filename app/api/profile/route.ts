import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreatorProfileInputSchema } from "@/lib/validation/schemas";
import { createProfile, getProfileById } from "@/lib/db/profile";

/**
 * GET /api/profile?id=xxx
 * Fetch a saved creator profile by id.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing required query param: id" }, { status: 400 });
  }

  const profile = await getProfileById(id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

/**
 * POST /api/profile
 * Validate and save a creator profile. Returns { id, ...profile }.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreatorProfileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const profile = await createProfile(parsed.data);
    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    console.error("[/api/profile POST]", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
