"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FloatingPageControlsProps {
  currentPage: number;
  currentJuz: number;
}

// Mapping halaman ke juz (Quran memiliki 30 juz dan 604 halaman)
// Juz 1: Halaman 1-20, Juz 2: 21-41, dst
const getJuzRangeForPage = (
  page: number
): { juz: number; minPage: number; maxPage: number } => {
  const juz = Math.ceil(page / 20);
  const minPage = (juz - 1) * 20 + 1;
  const maxPage = juz * 20;
  return { juz, minPage, maxPage };
};

const getPageRangeForJuz = (
  juz: number
): { minPage: number; maxPage: number } => {
  const minPage = (juz - 1) * 20 + 1;
  const maxPage = Math.min(juz * 20, 604);
  return { minPage, maxPage };
};

export function FloatingPageControls({
  currentPage,
  currentJuz,
}: FloatingPageControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState(currentJuz);
  const [selectedPage, setSelectedPage] = useState(currentPage);
  const router = useRouter();

  // Update selected values when props change
  useEffect(() => {
    setSelectedJuz(currentJuz);
    setSelectedPage(currentPage);
  }, [currentJuz, currentPage]);

  const handleJuzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const juz = parseInt(e.target.value);
    setSelectedJuz(juz);
    const { minPage } = getPageRangeForJuz(juz);
    setSelectedPage(minPage);
    router.push(`/page/${minPage}`);
    setIsOpen(false);
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const page = parseInt(e.target.value);
    setSelectedPage(page);
    router.push(`/page/${page}`);
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

  const { minPage: juzMinPage, maxPage: juzMaxPage } =
    getPageRangeForJuz(selectedJuz);

  return (
    <div
      className={`fixed ${
        isFullscreen ? "top-4 right-4" : "top-6 right-4 sm:right-6"
      } z-50`}
    >
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 sm:py-3 rounded-full bg-amber-900 text-amber-50 shadow-lg hover:shadow-xl transition-all active:scale-95 border border-amber-900/20 font-serif"
      >
        <span className="hidden sm:inline text-sm font-medium">
          Juz {selectedJuz} • Hal {selectedPage}
        </span>
        <span className="sm:hidden text-xs font-medium">
          {selectedPage}/604
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-amber-50 border-2 border-amber-900/20 rounded-lg shadow-2xl overflow-hidden w-80 animate-in fade-in slide-in-from-top-2 z-50">
          <div className="p-4 space-y-4">
            {/* Juz Selection */}
            <div>
              <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2 font-serif">
                Pilih Juz
              </label>
              <select
                value={selectedJuz}
                onChange={handleJuzChange}
                className="w-full px-3 py-2 border-2 border-amber-900/30 rounded-lg bg-white text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900 transition-colors font-serif"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                  <option key={juz} value={juz}>
                    Juz {juz} (Halaman {(juz - 1) * 20 + 1}-
                    {Math.min(juz * 20, 604)})
                  </option>
                ))}
              </select>
            </div>

            {/* Page Selection */}
            <div>
              <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2 font-serif">
                Pilih Halaman
              </label>
              <select
                value={selectedPage}
                onChange={handlePageChange}
                className="w-full px-3 py-2 border-2 border-amber-900/30 rounded-lg bg-white text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900 transition-colors font-serif"
              >
                {Array.from(
                  { length: juzMaxPage - juzMinPage + 1 },
                  (_, i) => juzMinPage + i
                ).map((page) => (
                  <option key={page} value={page}>
                    Halaman {page}
                  </option>
                ))}
              </select>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-amber-50 text-sm font-medium transition-colors active:scale-95 font-serif"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Fullscreen</span>
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
          className="mt-2 flex items-center justify-center p-2 rounded-full bg-amber-900 text-amber-50 shadow-lg hover:shadow-xl transition-all active:scale-95 border border-amber-900/20"
          title="Exit Fullscreen"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
