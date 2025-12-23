"use client";

import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { useAudioStore } from "@/store/useAudioStore";
import {
  Play,
  Pause,
  X,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  ListVideo,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AudioBar() {
  const {
    currentSurah,
    currentSurahName,
    currentAyah,
    totalVerses,
    isPlaying,
    audioUrl,
    qoriName,
    onNavigateNext,
    onNavigatePrev,
    repeatMode,
    autoAdvance,
    toggleRepeat,
    setAutoAdvance,
    togglePlay,
    stop,
    pause,
    play,
  } = useAudioStore();
  const howlRef = useRef<Howl | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (audioUrl) {
      setIsLoading(true);
      setHasError(false);

      if (howlRef.current) {
        howlRef.current.unload();
      }

      // Get current state for closure
      const state = useAudioStore.getState();

      howlRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        onplay: () => {
          console.log("Audio playing:", audioUrl);
          setIsLoading(false);
          play();
        },
        onpause: () => pause(),
        onend: () => {
          // Get fresh state from store
          const currentState = useAudioStore.getState();

          // Handle audio end based on repeat mode and auto-advance
          if (currentState.repeatMode === "one") {
            // Repeat current ayah
            howlRef.current?.play();
          } else if (
            currentState.autoAdvance ||
            currentState.repeatMode === "all"
          ) {
            // Auto advance to next ayah
            if (currentState.onNavigateNext) {
              currentState.onNavigateNext();
            } else {
              currentState.stop();
            }
          } else {
            currentState.stop();
          }
        },
        onloaderror: (id, error) => {
          console.error("Audio load error:", error, "URL:", audioUrl);
          setIsLoading(false);
          setHasError(true);
          stop();
        },
      });

      if (isPlaying) {
        howlRef.current.play();
      }
    }

    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!howlRef.current) return;

    if (isPlaying) {
      try {
        howlRef.current.play();
      } catch (error) {
        console.error("Failed to play audio:", error);
        setHasError(true);
      }
    } else {
      howlRef.current.pause();
    }
  }, [isPlaying]);

  if (!audioUrl) return null;

  if (hasError) {
    return (
      <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-8 duration-500">
        <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/50 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-red-600 font-semibold">
              Gagal memutar audio
            </p>
            <p className="text-xs text-red-500/80">URL: {audioUrl}</p>
          </div>
          <button
            onClick={stop}
            className="p-2 rounded-full hover:bg-red-500/20 text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-8 duration-500">
      <div className="max-w-xl mx-auto bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {isLoading ? "Memuat..." : "Memutar Ayat"} {currentAyah}
          </p>
          <h4 className="font-bold truncate text-primary">
            Surah {currentSurahName || currentSurah}
          </h4>
          {qoriName && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              Qori: {qoriName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Repeat Mode Button */}
          <button
            onClick={toggleRepeat}
            className={cn(
              "p-2 rounded-full transition-all",
              repeatMode === "off"
                ? "text-muted-foreground hover:bg-accent"
                : repeatMode === "one"
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            )}
            title={
              repeatMode === "off"
                ? "Repeat: Off"
                : repeatMode === "one"
                ? "Repeat: Current Ayah"
                : "Repeat: All Ayahs"
            }
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => onNavigatePrev?.()}
            disabled={!onNavigatePrev}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Ayat sebelumnya"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => onNavigateNext?.()}
            disabled={!onNavigateNext}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Ayat berikutnya"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Auto Advance Toggle */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={cn(
              "p-2 rounded-full transition-all flex",
              autoAdvance
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-muted-foreground hover:bg-accent"
            )}
            title={autoAdvance ? "Otomatis: Aktif" : "Otomatis: Mati"}
          >
            <ListVideo className="w-5 h-5" />
          </button>

          <button
            onClick={stop}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
