/**
 * Seed script — populates BenchmarkReference and BrandSignal tables
 * from local fixture files in data/.
 *
 * Run: npx prisma db seed
 */
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import type { BenchmarkRecord, BrandSignalRecord } from "../lib/validation/schemas";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

function loadJson<T>(relativePath: string): T {
  const fullPath = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(fullPath, "utf-8")) as T;
}

function resolveTier(
  minFollowers: number,
  maxFollowers: number
): "nano" | "micro" | "mid" | "macro" {
  if (minFollowers === 10000 && maxFollowers === 25000) return "nano";
  if (minFollowers === 25000 && maxFollowers === 50000) return "micro";
  if (minFollowers === 50000 && maxFollowers === 100000) return "mid";
  return "macro";
}

function normalizeNiche(niche: BenchmarkRecord["niche"]): string {
  return niche === "consumer_products" ? "consumer" : niche;
}

function normalizeSocialPresence(record: BrandSignalRecord): string {
  if (!record.social_presence || !record.legitimacy_flags.has_social) {
    return "none";
  }

  if (record.review_score !== null && record.review_score >= 4 && record.legitimacy_flags.is_verified) {
    return "strong";
  }

  if (record.review_score !== null && record.review_score >= 2.5) {
    return "moderate";
  }

  return "weak";
}

async function seedBenchmarks() {
  const records = loadJson<BenchmarkRecord[]>("data/benchmarks.json");

  await prisma.benchmarkReference.deleteMany();

  for (const r of records) {
    await prisma.benchmarkReference.create({
      data: {
        platform: r.platform.toLowerCase(),
        niche: normalizeNiche(r.niche),
        tier: resolveTier(r.follower_range_min, r.follower_range_max),
        follower_range_min: r.follower_range_min,
        follower_range_max: r.follower_range_max,
        deliverable_type: r.deliverable.toLowerCase(),
        avg_rate: r.avg_rate,
        min_rate: r.min_rate,
        max_rate: r.max_rate,
        source: r.source,
      },
    });
  }

  console.log(`Seeded ${records.length} benchmark records.`);
}

async function seedBrandSignals() {
  const records = loadJson<BrandSignalRecord[]>("data/brand-signals.json");

  await prisma.brandSignal.deleteMany();

  for (const r of records) {
    await prisma.brandSignal.create({
      data: {
        brand_name: r.brand_name,
        brand_url: r.brand_url,
        review_score: r.review_score ?? null,
        complaint_notes: r.complaint_notes ?? null,
        social_presence: normalizeSocialPresence(r),
        legitimacy_flags: JSON.stringify(r.legitimacy_flags),
      },
    });
  }

  console.log(`Seeded ${records.length} brand signal records.`);
}

async function main() {
  console.log("Starting seed...");
  await seedBenchmarks();
  await seedBrandSignals();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
