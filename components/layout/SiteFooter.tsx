import Link from "next/link";
import { Globe, Link2, Share2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#1A1A2E] py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
        {/* Left */}
        <p className="text-sm text-white/50">© 2026 Brandalyze. All rights reserved.</p>

        {/* Center — social icons */}
        <div className="flex items-center gap-4">
          <Link
            href="https://instagram.com/brandalyze"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 transition-colors hover:text-white"
            aria-label="Instagram"
          >
            <Globe className="h-4 w-4" />
          </Link>
          <Link
            href="https://linkedin.com/company/brandalyze"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 transition-colors hover:text-white"
            aria-label="LinkedIn"
          >
            <Link2 className="h-4 w-4" />
          </Link>
          <Link
            href="https://x.com/brandalyze"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 transition-colors hover:text-white"
            aria-label="Twitter / X"
          >
            <Share2 className="h-4 w-4" />
          </Link>
        </div>

        {/* Right */}
        <p className="text-xs text-white/30">Built for creators, by creators.</p>
      </div>
    </footer>
  );
}
