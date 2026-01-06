import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Qari {
  id: string;
  name: string;
  arabic_name?: string;
  reciter_id: string; // EveryAyah format: e.g., "Alafasy_64kbps"
}

export type MushafMode = "kemenag" | "uthmani";

interface SettingsState {
  arabicFontSize: number;
  translationFontSize: number;
  showWordByWord: boolean;
  selectedQariId: string;
  selectedQari: Qari | null;
  lastRead: {
    chapterId?: number;
    chapterName?: string;
    ayahNumber?: number;
    pageId?: number;
  } | null;
  fontFamily: string;
  showTranslation: boolean;
  mushafMode: MushafMode;

  // Actions
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setShowWordByWord: (show: boolean) => void;
  setSelectedQari: (qariId: string, qari: Qari) => void;
  setLastRead: (lastRead: SettingsState["lastRead"]) => void;
  setFontFamily: (font: string) => void;
  setShowTranslation: (show: boolean) => void;
  setMushafMode: (mode: MushafMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      arabicFontSize: 32,
      translationFontSize: 16,
      showWordByWord: true,
      selectedQariId: "Alafasy_64kbps",
      selectedQari: {
        id: "Alafasy_64kbps",
        name: "Mishary Rashid al-Afasy",
        arabic_name: "مشاري raashid العفاسي",
        reciter_id: "Alafasy_64kbps",
      },
      lastRead: null,
      fontFamily: "lpmq",
      showTranslation: true,
      mushafMode: "kemenag", // Default to Kemenag as requested

      setArabicFontSize: (size) => set({ arabicFontSize: size }),
      setTranslationFontSize: (size) => set({ translationFontSize: size }),
      setShowWordByWord: (show) => set({ showWordByWord: show }),
      setSelectedQari: (qariId, qari) =>
        set({ selectedQariId: qariId, selectedQari: qari }),
      setLastRead: (lastRead) => set({ lastRead }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setShowTranslation: (show) => set({ showTranslation: show }),
      setMushafMode: (mode) => set({ mushafMode: mode }),
    }),
    {
      name: "lumina-quran-settings",
    }
  )
);
