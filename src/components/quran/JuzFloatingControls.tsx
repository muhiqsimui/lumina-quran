"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Maximize2, Minimize2, Layers, Book } from "lucide-react";
import { Chapter, Verse } from "@/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface JuzFloatingControlsProps {
  currentJuz: number;
  chapters: Chapter[];
  verses: Verse[];
}

export function JuzFloatingControls({
  currentJuz,
  chapters,
  verses,
}: JuzFloatingControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState(currentJuz);
  
  const router = useRouter();

  // Extract Surahs that are at least partially in this Juz
  const surahsInJuzIds = Array.from(new Set(verses.map(v => parseInt(v.verse_key.split(":")[0]))));
  const surahsInJuz = chapters.filter(c => surahsInJuzIds.includes(c.id));

  const [selectedSurah, setSelectedSurah] = useState(surahsInJuz[0]?.id || 1);
  const [selectedAyah, setSelectedAyah] = useState(1);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      setIsFullscreen(!!document.fullscreenElement);
    }
  }, []);

  useEffect(() => {
    setSelectedJuz(currentJuz);
    if (surahsInJuz.length > 0) {
      setSelectedSurah(surahsInJuz[0].id);
      const firstAyahInSurah = verses.find(v => parseInt(v.verse_key.split(":")[0]) === surahsInJuz[0].id);
      if (firstAyahInSurah) setSelectedAyah(firstAyahInSurah.verse_number);
    }
  }, [currentJuz, surahsInJuzIds.length]);

  const handleJuzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const juzId = parseInt(e.target.value);
    setSelectedJuz(juzId);
    router.push(`/juz/${juzId}`);
    setIsOpen(false);
  };

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahId = parseInt(e.target.value);
    setSelectedSurah(surahId);
    // Find first ayah of this surah in this juz
    const firstAyah = verses.find(v => parseInt(v.verse_key.split(":")[0]) === surahId);
    if (firstAyah) setSelectedAyah(firstAyah.verse_number);
  };

  const jumpToAyah = () => {
    const element = document.querySelector(`[data-verse-key="${selectedSurah}:${selectedAyah}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setIsOpen(false);
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
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Filter ayahs available in current juz for selected surah
  const availableAyahs = verses.filter(v => parseInt(v.verse_key.split(":")[0]) === selectedSurah);

  if (!mounted) return null;

  return (
    <div className={cn("fixed z-50 transition-all duration-300", isFullscreen ? "top-4 right-4" : "top-6 right-4 sm:right-6")}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 sm:py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all active:scale-95 border border-primary/20"
      >
        <Layers className="w-4 h-4" />
        <span className="text-sm font-medium">Juz {currentJuz}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden w-72 sm:w-80 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 space-y-4">
            {/* Juz Selection */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pilih Juz</label>
              <select
                value={selectedJuz}
                onChange={handleJuzChange}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                  <option key={j} value={j}>Juz {j}</option>
                ))}
              </select>
            </div>

            {/* Surah In Juz Selection */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pilih Surah (Dalam Juz {currentJuz})</label>
              <select
                value={selectedSurah}
                onChange={handleSurahChange}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                {surahsInJuz.map((s) => (
                  <option key={s.id} value={s.id}>{s.id}. {s.name_simple}</option>
                ))}
              </select>
            </div>

            {/* Ayah Selection */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Pilih Ayat ({availableAyahs[0]?.verse_number}-{availableAyahs[availableAyahs.length - 1]?.verse_number})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={availableAyahs[0]?.verse_number}
                  max={availableAyahs[availableAyahs.length - 1]?.verse_number}
                  value={selectedAyah || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const min = availableAyahs[0]?.verse_number || 1;
                    const max = availableAyahs[availableAyahs.length - 1]?.verse_number || 1;

                    if (isNaN(val)) {
                      setSelectedAyah(0);
                      return;
                    }

                    if (val > max) {
                      setSelectedAyah(max);
                    } else if (val < min) {
                      setSelectedAyah(min);
                    } else {
                      setSelectedAyah(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      jumpToAyah();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-border rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="No. Ayat"
                />
                <button
                  onClick={jumpToAyah}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Lompat
                </button>
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
            >
              {isFullscreen ? (
                <><Minimize2 className="w-4 h-4" /><span>Keluar Fullscreen</span></>
              ) : (
                <><Maximize2 className="w-4 h-4" /><span>Mode Fullscreen</span></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
