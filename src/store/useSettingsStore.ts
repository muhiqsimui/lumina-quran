import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Qari {
  id: string;
  name: string;
  arabic_name?: string;
  reciter_id: string; // EveryAyah format: e.g., "Alafasy_64kbps"
}

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

  // Actions
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setShowWordByWord: (show: boolean) => void;
  setSelectedQari: (qariId: string, qari: Qari) => void;
  setLastRead: (lastRead: SettingsState["lastRead"]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      arabicFontSize: 32,
      translationFontSize: 16,
      showWordByWord: true,
      selectedQariId: "Alafasy_64kbps", // Default: Mishary al-Afasy
      selectedQari: {
        id: "Alafasy_64kbps",
        name: "Mishary Rashid al-Afasy",
        arabic_name: "مشاري راشد العفاسي",
        reciter_id: "Alafasy_64kbps",
      },
      lastRead: null,

      setArabicFontSize: (size) => set({ arabicFontSize: size }),
      setTranslationFontSize: (size) => set({ translationFontSize: size }),
      setShowWordByWord: (show) => set({ showWordByWord: show }),
      setSelectedQari: (qariId, qari) =>
        set({ selectedQariId: qariId, selectedQari: qari }),
      setLastRead: (lastRead) => set({ lastRead }),
    }),
    {
      name: "lumina-quran-settings",
    }
  )
);
