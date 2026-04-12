import { readFileSync } from "fs";
import { join } from "path";

/** Load and JSON-parse a file from the top-level data/ directory. */
export function loadFixture<T>(filename: string): T {
  const fullPath = join(process.cwd(), "data", filename);
  return JSON.parse(readFileSync(fullPath, "utf-8")) as T;
}
