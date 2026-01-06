"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import { Chapter } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FloatingControlsProps {
  chapters: Chapter[];
  currentChapterId: number;
  currentVerseNumber: number;
  totalVerses: number;
}

export function FloatingControls({
  chapters,
  currentChapterId,
  currentVerseNumber,
  totalVerses,
}: FloatingControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(currentChapterId);
  const [selectedAyah, setSelectedAyah] = useState(currentVerseNumber);
  const router = useRouter();

  // Handle mounting status
  useEffect(() => {
    setMounted(true);
    // Check initial fullscreen state
    if (typeof document !== 'undefined') {
      setIsFullscreen(!!document.fullscreenElement);
    }
  }, []);

  // Update selected values when props change
  useEffect(() => {
    setSelectedSurah(currentChapterId);
    setSelectedAyah(currentVerseNumber);
  }, [currentChapterId, currentVerseNumber]);

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahId = parseInt(e.target.value);
    setSelectedSurah(surahId);
    setSelectedAyah(1);
    router.push(`/${surahId}`);
    setIsOpen(false);
  };

  const handleAyahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ayahNum = parseInt(e.target.value);
    setSelectedAyah(ayahNum);
    const element = document.querySelector(`[data-verse-number="${ayahNum}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const currentChapter = chapters.find((c) => c.id === selectedSurah);

  if (!mounted) return null;

  return (
    <div
      className={`fixed ${
        isFullscreen ? "top-4 right-4" : "top-6 right-4 sm:right-6"
      } z-50`}
    >
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 sm:py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all active:scale-95 border border-primary/20"
      >
        <span className="hidden sm:inline text-sm font-medium">
          {currentChapter?.name_simple} • Ayat {selectedAyah}
        </span>
        <span className="sm:hidden text-xs font-medium">
          {selectedAyah}/{totalVerses}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden w-72 sm:w-80 animate-in fade-in slide-in-from-top-2 z-50">
          <div className="p-4 space-y-4">
            {/* Surah Selection */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Pilih Surah
              </label>
              <select
                value={selectedSurah}
                onChange={handleSurahChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.id}. {chapter.name_simple} ({chapter.verses_count}{" "}
                    ayat)
                  </option>
                ))}
              </select>
            </div>

            {/* Ayah Selection */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Pilih Ayat
              </label>
              <select
                value={selectedAyah}
                onChange={handleAyahChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                {Array.from({ length: totalVerses }, (_, i) => i + 1).map(
                  (num) => (
                    <option key={num} value={num}>
                      Ayat {num}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors active:scale-95"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Fullscreen Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Fullscreen Button (when fullscreen) */}
      {isFullscreen && !isOpen && (
        <button
          onClick={toggleFullscreen}
          className="mt-2 flex items-center justify-center p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all active:scale-95 border border-primary/20"
          title="Exit Fullscreen"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
