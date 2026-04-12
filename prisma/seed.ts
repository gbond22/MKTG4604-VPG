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

async function seedBenchmarks() {
  const records = loadJson<BenchmarkRecord[]>("data/benchmarks.json");

  await prisma.benchmarkReference.deleteMany();

  for (const r of records) {
    await prisma.benchmarkReference.create({
      data: {
        id: r.id,
        platform: r.platform,
        niche: r.niche,
        tier: r.tier,
        follower_range_min: r.followers_min,
        follower_range_max: r.followers_max,
        deliverable_type: r.deliverable_type,
        avg_rate: (r.range_low + r.range_high) / 2,
        min_rate: r.range_low,
        max_rate: r.range_high,
        source: r.source,
        year: r.year ?? null,
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
        id: r.id,
        brand_name: r.brand_name,
        brand_url: r.brand_url ?? null,
        brand_handle: r.brand_handle ?? null,
        review_score: r.review_score ?? null,
        complaint_notes: r.complaint_notes ?? null,
        social_presence: r.social_presence,
        legitimacy_flags: JSON.stringify(r.legitimacy_flags),
        last_updated: r.last_updated ?? null,
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
