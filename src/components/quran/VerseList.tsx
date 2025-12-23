"use client";

import { useState, useEffect } from "react";
import { Verse } from "@/types";
import { AyahItem } from "./AyahItem";
import { TafsirSheet } from "./TafsirSheet";
import { useAudioStore } from "@/store/useAudioStore";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useScrollToAyah } from "@/hooks/useScrollToAyah";
import { useDebounce } from "@/hooks/useDebounce";

interface VerseListProps {
  verses: Verse[];
  chapterId: number;
  chapterName: string;
}

export function VerseList({ verses, chapterId, chapterName }: VerseListProps) {
  const [activeTafsir, setActiveTafsir] = useState<string | null>(null);
  const [lastReadAyah, setLastReadAyah] = useState<number>(1);
  const { setAudio, currentAyah, setNavigationCallbacks } = useAudioStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const { setLastRead, selectedQari } = useSettingsStore();

  useScrollToAyah(currentAyah);

  // Debounce last read updates to avoid excessive store updates
  const debouncedLastReadAyah = useDebounce(lastReadAyah, 800);

  // Initialize with first ayah when component mounts
  useEffect(() => {
    setLastReadAyah(1);
  }, [chapterId]);

  // Save debounced last read to persistent store
  useEffect(() => {
    setLastRead({
      chapterId,
      chapterName,
      ayahNumber: debouncedLastReadAyah,
    });
  }, [debouncedLastReadAyah, chapterId, chapterName, setLastRead]);

  // Register navigation callbacks for AudioBar
  useEffect(() => {
    const handleNextAyah = () => {
      const { repeatMode } = useAudioStore.getState();
      if (lastReadAyah < verses.length) {
        const nextVerse = verses[lastReadAyah];
        handlePlay(nextVerse);
      } else if (repeatMode === "all") {
        // Loop back to Ayah 1 of current surah
        handlePlay(verses[0]);
      }
    };

    const handlePrevAyah = () => {
      if (lastReadAyah > 1) {
        const prevVerse = verses[lastReadAyah - 2];
        handlePlay(prevVerse);
      }
    };

    setNavigationCallbacks(handleNextAyah, handlePrevAyah);
  }, [lastReadAyah, verses, setNavigationCallbacks]);

  const handlePlay = (verse: Verse) => {
    // Use selectedQari from store, or fallback to default
    if (!selectedQari) return;

    // Pad surah and verse numbers with leading zeros (001001 format)
    const surahPadded = String(chapterId).padStart(3, "0");
    const versePadded = String(verse.verse_number).padStart(3, "0");

    // Build audio URL using EveryAyah API with selected qari
    const audioUrl = `https://everyayah.com/data/${selectedQari.reciter_id}/${surahPadded}${versePadded}.mp3`;

    setAudio(
      chapterId,
      verse.verse_number,
      audioUrl,
      chapterName,
      selectedQari.name,
      verses.length
    );

    // Update last read ayah when playing
    setLastReadAyah(verse.verse_number);
  };

  const handleBookmark = (verse: Verse) => {
    if (isBookmarked(verse.verse_key)) {
      removeBookmark(verse.verse_key);
    } else {
      addBookmark({
        chapterId,
        chapterName,
        ayahNumber: verse.verse_number,
        ayahKey: verse.verse_key,
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {verses.map((verse) => (
          <AyahItem
            key={verse.id}
            verse={verse}
            isActive={currentAyah === verse.verse_number}
            isBookmarked={isBookmarked(verse.verse_key)}
            onPlay={() => handlePlay(verse)}
            onTafsir={() => setActiveTafsir(verse.verse_key)}
            onBookmark={() => handleBookmark(verse)}
          />
        ))}
      </div>

      <TafsirSheet
        ayahKey={activeTafsir}
        onClose={() => setActiveTafsir(null)}
      />
    </>
  );
}
