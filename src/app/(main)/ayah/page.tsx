"use client";

import { useState, useEffect } from "react";
import { getChapters, getVerses, getAudioUrl } from "@/lib/api";
import { Chapter, Verse } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"; // Tambah icon bookmark
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAudioStore } from "@/store/useAudioStore";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SingleAyahPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentSurahId, setCurrentSurahId] = useState<number>(1);
  const [currentVerseNumber, setCurrentVerseNumber] = useState<number>(1);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const { arabicFontSize, translationFontSize, setLastRead } =
    useSettingsStore();

  // Ambil fungsi dari bookmark store
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const { setAudio } = useAudioStore();
  const { selectedQari } = useSettingsStore();

  // Debounce the ayah updates to auto-save last read position
  const debouncedAyah = useDebounce(
    { surah: currentSurahId, ayah: currentVerseNumber },
    800
  );

  useEffect(() => {
    getChapters().then((data) => setChapters(data.chapters));
  }, []);

  useEffect(() => {
    async function fetchVerse() {
      setLoading(true);
      try {
        const data = await getVerses(currentSurahId);
        const targetVerse = data.verses.find(
          (v) => v.verse_number === currentVerseNumber
        );

        if (targetVerse) {
          setVerse(targetVerse);
        } else {
          if (data.verses.length > 0) {
            setCurrentVerseNumber(1);
            setVerse(data.verses[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch verse", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVerse();
  }, [currentSurahId, currentVerseNumber]);


  // Save debounced last read position to persistent store
  useEffect(() => {
    const currentChapter = chapters.find((c) => c.id === debouncedAyah.surah);
    if (currentChapter) {
      setLastRead({
        chapterId: debouncedAyah.surah,
        chapterName: currentChapter.name_simple,
        ayahNumber: debouncedAyah.ayah,
      });
    }
  }, [debouncedAyah, chapters, setLastRead]);

  // Cek apakah ayat saat ini sudah dibookmark
  const bookmarked = verse ? isBookmarked(verse.verse_key) : false;

  const handleBookmark = () => {
    if (!verse) return;
    const chapterName =
      chapters.find((c) => c.id === currentSurahId)?.name_simple || "";

    // Kirim data yang dibutuhkan ke store
    toggleBookmark({
      chapterId: currentSurahId,
      ayahNumber: verse.verse_number,
      ayahKey: verse.verse_key,
      chapterName: chapterName,
      textArabic: verse.text_uthmani,
      translation: verse.translations?.[0]?.text,
    });
  };

  const handleNext = () => {
    const currentChapter = chapters.find((c) => c.id === currentSurahId);
    if (!currentChapter) return;

    let nextSurah = currentSurahId;
    let nextVerse = currentVerseNumber;

    const { repeatMode } = useAudioStore.getState();

    if (currentVerseNumber < currentChapter.verses_count) {
      nextVerse = currentVerseNumber + 1;
    } else if (currentSurahId < 114) {
      nextSurah = currentSurahId + 1;
      nextVerse = 1;
    } else if (repeatMode === "all") {
      // Loop back to the beginning
      nextSurah = 1;
      nextVerse = 1;
    }

    // Update state
    setCurrentSurahId(nextSurah);
    setCurrentVerseNumber(nextVerse);
    // Auto-play the next verse after state updates
    // Note: verse will be fetched via useEffect, then we play it
  };

  const handlePrev = () => {
    let prevSurah = currentSurahId;
    let prevVerse = currentVerseNumber;

    if (currentVerseNumber > 1) {
      prevVerse = currentVerseNumber - 1;
    } else if (currentSurahId > 1) {
      prevSurah = currentSurahId - 1;
      const prevChapter = chapters.find((c) => c.id === prevSurah);
      prevVerse = prevChapter?.verses_count || 1;
    }

    // Update state
    setCurrentSurahId(prevSurah);
    setCurrentVerseNumber(prevVerse);
    // Auto-play the previous verse after state updates
  };

  // Register navigation callbacks so AudioBar can trigger page changes
  useEffect(() => {
    const { setNavigationCallbacks } = useAudioStore.getState();
    setNavigationCallbacks(handleNext, handlePrev);
  }, [chapters, currentSurahId, currentVerseNumber]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Navigation & Selector */}
      <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>

          <select
            value={currentSurahId}
            onChange={(e) => {
              setCurrentSurahId(Number(e.target.value));
              setCurrentVerseNumber(1);
            }}
            className="flex-1 sm:flex-none bg-transparent font-semibold focus:outline-none text-center appearance-none cursor-pointer px-2"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}. {c.name_simple}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={currentVerseNumber}
            onChange={(e) => setCurrentVerseNumber(Number(e.target.value))}
            className="w-full appearance-none bg-secondary text-secondary-foreground font-medium px-4 py-2 pr-8 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {chapters.find((c) => c.id === currentSurahId)?.verses_count ? (
              Array.from(
                {
                  length: chapters.find((c) => c.id === currentSurahId)!
                    .verses_count,
                },
                (_, i) => i + 1
              ).map((num) => (
                <option key={num} value={num}>
                  Ayat {num}
                </option>
              ))
            ) : (
              <option value={1}>Ayat 1</option>
            )}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-12 py-10 relative">
        {/* Tombol Bookmark Melayang (Floating) agar Mobile Friendly */}
        {!loading && verse && (
          <button
            onClick={handleBookmark}
            className={cn(
              "absolute -top-4 right-4 p-3 rounded-full transition-all active:scale-90 shadow-sm border",
              bookmarked
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        )}

        {loading ? (
          <div className="animate-pulse space-y-8 w-full">
            <div className="h-20 bg-muted rounded-xl w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        ) : verse ? (
          <>
            <div
              className="font-arabic leading-[2.5] md:leading-[3.6] text-foreground tracking-normal w-full px-4 break-words"
              dir="rtl"
              style={{
                fontSize: `clamp(${arabicFontSize}px, 8vw, ${
                  arabicFontSize * 1.5
                }px)`,
              }}
            >
              {verse.text_uthmani}
            </div>

            <p
              className="text-muted-foreground leading-relaxed max-w-lg px-4"
              style={{
                fontSize: `clamp(${translationFontSize}px, 4vw, ${
                  translationFontSize * 1.25
                }px)`,
              }}
            >
              {verse.translations?.[0]?.text.replace(/<(?:.|\n)*?>/gm, "")}
            </p>
          </>
        ) : (
          <div className="text-muted-foreground">Ayat tidak ditemukan.</div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={handlePrev}
          disabled={currentSurahId === 1 && currentVerseNumber === 1}
          className="p-4 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!verse) return;
              const { selectedQari } = useSettingsStore.getState();
              if (!selectedQari) return;

              const audioUrl = getAudioUrl(
                selectedQari.reciter_id,
                currentSurahId,
                currentVerseNumber
              );
              const surahName =
                chapters.find((c) => c.id === currentSurahId)?.name_simple ||
                `Surah ${currentSurahId}`;

              useAudioStore
                .getState()
                .setAudio(
                  currentSurahId,
                  currentVerseNumber,
                  audioUrl,
                  surahName,
                  selectedQari.name
                );
            }}
            className="p-3 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors active:scale-95 shadow-sm"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-4 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
