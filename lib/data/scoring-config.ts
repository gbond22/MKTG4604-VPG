import { loadFixture } from "./fixture-loader";
import { ScoringConfigSchema } from "@/lib/validation/schemas";
import type { ScoringConfig } from "@/lib/validation/schemas";

let _cache: ScoringConfig | null = null;

/** Load and validate scoring-config.json. Throws if the file is malformed. */
export function getScoringConfig(): ScoringConfig {
  if (_cache) return _cache;

  const raw = loadFixture<unknown>("scoring-config.json");
  const result = ScoringConfigSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid scoring config: ${result.error.message}`);
  }
  _cache = result.data;
  return _cache;
}
