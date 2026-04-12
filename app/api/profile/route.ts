import { NextRequest, NextResponse } from "next/server";

/**
 * /api/profile
 *
 * GET  — fetch saved creator profile (stub)
 * POST — upsert creator profile (stub)
 *
 * TODO (step 5): validate with CreatorProfileInputSchema, persist via Prisma,
 *               return saved CreatorProfile record.
 */
export async function GET() {
  return NextResponse.json(
    { message: "Profile endpoint — coming in step 5." },
    { status: 501 }
  );
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { message: "Profile endpoint — coming in step 5." },
    { status: 501 }
  );
}
