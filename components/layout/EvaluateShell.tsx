"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Shield, User, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "./SiteFooter";

// ── Logo with fallback ────────────────────────────────────────────────────────
function NavLogo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B6B6D]/20 text-white shrink-0">
        <Shield className="h-6 w-6" />
      </div>
    );
  }

  return (
    <Image
      src="/logo.svg"
      alt="Brandalyze logo"
      width={48}
      height={48}
      className="rounded-xl object-contain shrink-0 cursor-pointer"
      onError={() => setFailed(true)}
    />
  );
}

// ── 3-step stepper ────────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: "Your Profile", pattern: /^\/profile/ },
  { number: 2, label: "Paste Offer", pattern: /^\/evaluate/ },
  { number: 3, label: "Evaluation", pattern: /^\/results/ },
] as const;

function StepBar() {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((s) => s.pattern.test(pathname));
  const current = activeIndex >= 0 ? activeIndex + 1 : 1;

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const done = step.number < current;
        const active = step.number === current;
        return (
          <div key={step.number} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-2 transition-colors",
                  active
                    ? "bg-[#1B6B6D] text-white ring-[#1B6B6D]"
                    : done
                    ? "bg-[#1B6B6D]/20 text-[#1B6B6D] ring-[#1B6B6D]/20"
                    : "bg-[#D4D0CA] text-[#999999] ring-[#D4D0CA]",
                ].join(" ")}
              >
                {step.number}
              </div>
              <span
                className={[
                  "text-[10px] font-medium whitespace-nowrap",
                  active || done ? "text-[#1B6B6D]" : "text-[#999999]",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "h-px flex-1 mx-2 mb-4 transition-colors",
                  step.number < current ? "bg-[#1B6B6D]" : "bg-[#D4D0CA]",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
interface EvaluateShellProps {
  children: React.ReactNode;
}

export function EvaluateShell({ children }: EvaluateShellProps) {
  return (
    <div className="min-h-screen bg-[#EDE7DF] flex flex-col">
      {/* Navbar */}
      <header className="bg-[#1A1A2E] px-6 py-4 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <NavLogo />
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Brandalyze
              </h1>
              <span className="hidden sm:block text-base text-white/50">
                Better brand deals, backed by data.
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              <Info className="h-4 w-4" />
              About
            </Link>
            <Badge className="bg-[#1B6B6D]/30 text-white border border-[#1B6B6D] hover:bg-[#1B6B6D]/30 text-xs font-medium px-2.5 py-0.5 hidden sm:inline-flex">
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      {/* Step progress bar */}
      <div className="border-b border-[#D4D0CA] bg-[#F5F0EB] px-6 py-4">
        <div className="mx-auto max-w-xs">
          <StepBar />
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <SiteFooter />
    </div>
  );
}
