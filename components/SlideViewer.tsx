"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface SlideViewerProps {
  totalSlides?: number;
}

export function SlideViewer({ totalSlides = 10 }: SlideViewerProps) {
  const [current, setCurrent] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 1 ? totalSlides : c - 1));
  }, [totalSlides]);

  const next = useCallback(() => {
    setCurrent((c) => (c === totalSlides ? 1 : c + 1));
  }, [totalSlides]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <div
      ref={containerRef}
      className={[
        "flex flex-col items-center gap-3 rounded-2xl border border-[#D4D0CA] p-4",
        isFullscreen
          ? "bg-[#1A1A2E] justify-center min-h-screen"
          : "bg-[#F5F0EB]",
      ].join(" ")}
    >
      {/* Slide image */}
      <div className="relative w-full flex items-center justify-center">
        <Image
          key={current}
          src={`/slides/slide-${current}.jpg`}
          alt={`Slide ${current} of ${totalSlides}`}
          width={1280}
          height={720}
          className={[
            "w-auto rounded-lg object-contain",
            isFullscreen ? "max-h-[90vh]" : "max-h-[600px]",
          ].join(" ")}
          priority
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4D0CA] bg-white text-[#2D2D3F] transition-colors hover:bg-[#EDE7DF] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className={["text-sm font-medium", isFullscreen ? "text-white/60" : "text-[#999999]"].join(" ")}>
          Slide {current} / {totalSlides}
        </span>

        <button
          onClick={next}
          aria-label="Next slide"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4D0CA] bg-white text-[#2D2D3F] transition-colors hover:bg-[#EDE7DF] disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
            isFullscreen
              ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
              : "border-[#D4D0CA] bg-white text-[#2D2D3F] hover:bg-[#EDE7DF]",
          ].join(" ")}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
