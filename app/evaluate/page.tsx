import type { Metadata } from "next";
import { EvaluateClient } from "./EvaluateClient";

export const metadata: Metadata = {
  title: "Evaluate Offer — Brand Deal Evaluator",
};

export default function EvaluatePage() {
  return <EvaluateClient />;
}
