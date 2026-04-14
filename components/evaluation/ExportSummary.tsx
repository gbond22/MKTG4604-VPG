"use client";

import type { EvaluationResult } from "@/lib/validation/schemas";
import type { ProfileSummary, BrandSummary } from "@/lib/db/evaluation";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function fmtMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const DECISION_LABEL: Record<string, string> = {
  ACCEPT: "Accept",
  NEGOTIATE: "Negotiate",
  DECLINE: "Decline",
  NEED_MORE_INFO: "Need More Info",
};

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_ORDER: Record<string, number> = {
  must_have: 0,
  nice_to_have: 1,
  informational: 2,
};

const PRIORITY_LABEL: Record<string, string> = {
  must_have: "Must Have",
  nice_to_have: "Nice to Have",
  informational: "Informational",
};

// ── Print document ────────────────────────────────────────────────────────────

interface ExportSummaryProps {
  result: EvaluationResult;
  profile: ProfileSummary;
  brand: BrandSummary;
  evaluationDate: string; // pre-formatted ISO string from server
}

export function ExportSummary({
  result,
  profile,
  brand,
  evaluationDate,
}: ExportSummaryProps) {
  const dateLabel = new Date(evaluationDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sortedFlags = [...result.risk_flags].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );
  const sortedPoints = [...result.negotiation_points].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );

  const subscores = result.subscore_breakdown;

  return (
    <>
      {/* ── Trigger button (screen only) ── */}
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-[#C4613A] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#a84e2f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4613A]"
        aria-label="Download evaluation summary as PDF"
      >
        {/* printer icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect width="12" height="8" x="6" y="14" />
        </svg>
        Download PDF
      </button>

      {/* ── Print-only content ── */}
      <div className="print-summary" aria-hidden="true" style={{ fontFamily: "system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.4, color: "#000" }}>

        {/* Header */}
        <div style={{ borderBottom: "2px solid #1B6B6D", paddingBottom: "8px", marginBottom: "12px" }}>
          <div style={{ fontSize: "14pt", fontWeight: 700, color: "#1A1A2E" }}>
            Brandalyze — Evaluation Summary
          </div>
          <div style={{ fontSize: "9pt", color: "#555", marginTop: "2px" }}>
            Generated {dateLabel}
          </div>
        </div>

        {/* Row 1: Creator profile + Brand */}
        <div className="print-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
          {/* Creator profile */}
          <div style={{ border: "1px solid #D4D0CA", borderRadius: "6px", padding: "10px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "6px" }}>
              Creator Profile
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5pt" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#555", paddingRight: "8px", paddingBottom: "3px" }}>Platform</td>
                  <td style={{ fontWeight: 500, paddingBottom: "3px" }}>{capitalize(profile.platform)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#555", paddingRight: "8px", paddingBottom: "3px" }}>Niche</td>
                  <td style={{ fontWeight: 500, paddingBottom: "3px" }}>{capitalize(profile.niche)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#555", paddingRight: "8px", paddingBottom: "3px" }}>Followers</td>
                  <td style={{ fontWeight: 500, paddingBottom: "3px" }}>{fmt(profile.followers)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#555", paddingRight: "8px", paddingBottom: "3px" }}>Engagement</td>
                  <td style={{ fontWeight: 500, paddingBottom: "3px" }}>{(profile.engagement_rate * 100).toFixed(1)}%</td>
                </tr>
                {profile.handle && (
                  <tr>
                    <td style={{ color: "#555", paddingRight: "8px", paddingBottom: "3px" }}>Handle</td>
                    <td style={{ fontWeight: 500, paddingBottom: "3px" }}>@{profile.handle}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ color: "#555", paddingRight: "8px" }}>Location</td>
                  <td style={{ fontWeight: 500 }}>{profile.geography}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Decision + score */}
          <div style={{ border: "1px solid #D4D0CA", borderRadius: "6px", padding: "10px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "6px" }}>
              Evaluation Decision
            </div>

            {/* Brand */}
            {(brand.name || brand.handle) && (
              <div style={{ fontSize: "9.5pt", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#555" }}>Brand: </span>
                <span style={{ fontWeight: 500 }}>{brand.name ?? brand.handle}</span>
                {brand.url && (
                  <span style={{ color: "#555", fontSize: "8.5pt" }}> · {brand.url}</span>
                )}
              </div>
            )}

            <div style={{ fontSize: "13pt", fontWeight: 700, marginBottom: "4px" }}>
              {DECISION_LABEL[result.decision_status] ?? result.decision_status}
            </div>
            <div style={{ fontSize: "11pt", marginBottom: "4px" }}>
              Score:{" "}
              <span style={{ fontWeight: 700 }}>
                {result.composite_score !== null ? `${result.composite_score} / 100` : "—"}
              </span>
            </div>
            <div style={{ fontSize: "9.5pt", color: "#555" }}>
              Confidence: {capitalize(result.confidence_level)}
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        {subscores && (
          <div className="print-section" style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "6px" }}>
              Score Breakdown
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
              {[
                { label: "Fair Pay", value: subscores.fair_pay },
                { label: "Brand Risk", value: subscores.brand_risk },
                { label: "Fit", value: subscores.fit },
                { label: "Terms Burden", value: subscores.terms_burden },
              ].map(({ label, value }) => (
                <div key={label} style={{ border: "1px solid #D4D0CA", borderRadius: "5px", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "9pt", color: "#555", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "12pt", fontWeight: 700 }}>{value}</div>
                  {/* Score bar */}
                  <div style={{ height: "4px", background: "#E0E0E0", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      borderRadius: "2px",
                      width: `${value}%`,
                      background: value >= 70 ? "#1B6B6D" : value >= 50 ? "#D4A84B" : "#C4613A",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fair market range */}
        {result.fair_market_range && (
          <div className="print-section" style={{ border: "1px solid #D4D0CA", borderRadius: "6px", padding: "10px", marginBottom: "12px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "4px" }}>
              Fair Market Range
            </div>
            <div style={{ fontSize: "12pt", fontWeight: 700 }}>
              {fmtMoney(result.fair_market_range.low, result.fair_market_range.currency)}
              {" – "}
              {fmtMoney(result.fair_market_range.high, result.fair_market_range.currency)}
            </div>
            {result.fair_market_range.basis && (
              <div style={{ fontSize: "8.5pt", color: "#555", marginTop: "2px" }}>
                {result.fair_market_range.basis}
              </div>
            )}
          </div>
        )}

        {/* Risk flags */}
        {sortedFlags.length > 0 && (
          <div className="print-section" style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "6px" }}>
              Risk Flags ({sortedFlags.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {sortedFlags.map((flag, i) => (
                <div key={i} className="print-section" style={{ border: "1px solid #D4D0CA", borderRadius: "5px", padding: "7px 9px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "2px" }}>
                    <span style={{
                      fontSize: "7.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: flag.severity === "critical" || flag.severity === "high" ? "#C4613A22" : flag.severity === "medium" ? "#D4A84B22" : "#4A6FA522",
                      color: flag.severity === "critical" || flag.severity === "high" ? "#C4613A" : flag.severity === "medium" ? "#a07a00" : "#4A6FA5",
                    }}>
                      {capitalize(flag.severity)}
                    </span>
                    <span style={{ fontSize: "9.5pt", fontWeight: 600 }}>
                      {flag.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <div style={{ fontSize: "9pt", color: "#333" }}>{flag.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fit summary */}
        {result.fit_summary && (
          <div className="print-section" style={{ border: "1px solid #D4D0CA", borderRadius: "6px", padding: "10px", marginBottom: "12px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "4px" }}>
              Brand &amp; Audience Fit
            </div>
            <div style={{ fontSize: "9.5pt", lineHeight: 1.5 }}>{result.fit_summary}</div>
          </div>
        )}

        {/* Negotiation points */}
        {sortedPoints.length > 0 && (
          <div className="print-section" style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "8pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "6px" }}>
              Negotiation Points ({sortedPoints.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {sortedPoints.map((pt, i) => (
                <div key={i} className="print-section" style={{ border: "1px solid #D4D0CA", borderRadius: "5px", padding: "7px 9px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "3px" }}>
                    <span style={{
                      fontSize: "7.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: pt.priority === "must_have" ? "#C4613A22" : pt.priority === "nice_to_have" ? "#D4A84B22" : "#1B6B6D22",
                      color: pt.priority === "must_have" ? "#C4613A" : pt.priority === "nice_to_have" ? "#a07a00" : "#1B6B6D",
                    }}>
                      {PRIORITY_LABEL[pt.priority]}
                    </span>
                    <span style={{ fontSize: "9.5pt", fontWeight: 600 }}>{pt.topic}</span>
                  </div>
                  <div style={{ fontSize: "9pt", marginBottom: pt.rationale ? "2px" : 0 }}>
                    <span style={{ color: "#555" }}>Ask: </span>{pt.suggested_ask}
                  </div>
                  {pt.rationale && (
                    <div style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic" }}>{pt.rationale}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #D4D0CA", paddingTop: "8px", marginTop: "8px", fontSize: "8pt", color: "#888", display: "flex", justifyContent: "space-between" }}>
          <span>Brandalyze — brandalyze.com</span>
          <span>Generated {dateLabel}</span>
        </div>
      </div>
    </>
  );
}
