import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ClipboardEdit,
  ArrowRight,
  User,
  FileText,
  BarChart3,
  Info,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Brandalyze — Better brand deals, backed by data.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#1A1A2E]">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-20 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Brandalyze logo"
              width={40}
              height={40}
              className="rounded-xl object-contain shrink-0 cursor-pointer"
              priority
            />
            <div className="flex items-baseline gap-2.5">
              <span className="text-lg font-semibold tracking-tight text-white">
                Brandalyze
              </span>
              <span className="hidden sm:block text-sm text-white/50">
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
            <Link
              href="/profile"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#1B6B6D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#155456]"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #1E2A3A 0%, #1A1A2E 100%)",
        }}
      >
        {/* Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#1B6B6D]/20 blur-3xl pointer-events-none" />

        {/* Floating preview cards — desktop only */}
        {/* Top-left */}
        <div className="hidden lg:block absolute left-[8%] top-[22%] w-[200px] -rotate-6">
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/50">
              Deal Score
            </p>
            <p className="text-3xl font-bold text-[#1B6B6D]">72</p>
            <span className="mt-2 inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              Negotiate
            </span>
          </div>
        </div>

        {/* Top-right */}
        <div className="hidden lg:block absolute right-[8%] top-[20%] w-[200px] rotate-3">
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/50">
              Fair Market Range
            </p>
            <p className="text-xl font-bold text-white">$650 – $950</p>
          </div>
        </div>

        {/* Bottom-right */}
        <div className="hidden lg:block absolute right-[10%] bottom-[28%] w-[200px] -rotate-3">
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <span className="inline-block rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Low Risk
            </span>
            <p className="mt-2 text-xs text-white/60">Brand verified</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Brandalyze"
              width={100}
              height={100}
              priority
              className="mb-6 cursor-pointer"
            />
          </Link>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Brandalyze
          </h1>
          <p className="mt-4 text-xl text-white/60">
            Better brand deals, backed by data.
          </p>
          <p className="mt-2 text-base text-white/40">
            AI-powered deal evaluation for independent creators.
          </p>

          {/* Action cards */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            {/* Coming soon */}
            <div className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 opacity-50 cursor-not-allowed select-none sm:w-[300px]">
              <div className="relative">
                <span className="absolute -top-1 right-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  Coming Soon
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <Camera className="h-5 w-5 text-white/60" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white/70">
                  Connect your account
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                  Coming soon — auto-import your profile from Instagram
                </p>
              </div>
            </div>

            {/* Enter manually */}
            <Link
              href="/profile"
              className="group flex w-full flex-col gap-4 rounded-2xl bg-[#1B6B6D] p-8 transition-all duration-200 hover:scale-105 hover:bg-[#155456] active:scale-100 sm:w-[300px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <ClipboardEdit className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-1 flex-col justify-between text-left">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Enter details manually
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                    Set up your creator profile and evaluate a deal
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-medium text-white/70 transition-colors group-hover:text-white">
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="bg-[#EDE7DF] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#1A1A2E]">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#1B6B6D] text-base font-bold text-white">
                1
              </div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B6B6D]/10 text-[#1B6B6D]">
                <User className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A2E]">
                Enter your profile
              </p>
              <p className="mt-1 text-xs text-[#999999]">
                Tell us about your audience and niche
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#1B6B6D] text-base font-bold text-white">
                2
              </div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B6B6D]/10 text-[#1B6B6D]">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A2E]">
                Paste the offer
              </p>
              <p className="mt-1 text-xs text-[#999999]">
                Drop in the brand&apos;s DM, email, or brief
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#1B6B6D] text-base font-bold text-white">
                3
              </div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B6B6D]/10 text-[#1B6B6D]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A2E]">
                Get your score
              </p>
              <p className="mt-1 text-xs text-[#999999]">
                Instant evaluation with negotiation points
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
