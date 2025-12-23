import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DzikirState {
  counter: number;
  target: number;
  soundOn: boolean;
  mode: "manual" | "cycle";
  activeDzikir: string;
  isAssistActive: boolean;
  assistCategoryId: string | null;
  activeDzikirId: string | null;
  
  // Actions
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setTarget: (target: number) => void;
  toggleSound: () => void;
  setMode: (mode: "manual" | "cycle") => void;
  setActiveDzikir: (name: string) => void;
  toggleAssist: () => void;
  setAssistCategory: (categoryId: string | null) => void;
  setAssistDzikir: (dzikirId: string | null) => void;
}

const CYCLE_MODES = ["Subhanallah", "Alhamdulillah", "Allahu Akbar"];

export const useDzikirStore = create<DzikirState>()(
  persist(
    (set) => ({
      counter: 0,
      target: 33,
      soundOn: true,
      mode: "manual",
      activeDzikir: "Subhanallah",
      isAssistActive: false,
      assistCategoryId: null,
      activeDzikirId: null,

      increment: () =>
        set((state) => {
          const nextCounter = state.counter + 1;
          
          if (state.mode === "cycle" && nextCounter > state.target) {
            const nextIndex = (CYCLE_MODES.indexOf(state.activeDzikir) + 1) % CYCLE_MODES.length;
            return {
              counter: 1,
              activeDzikir: CYCLE_MODES[nextIndex]
            };
          }
          
          return {
            counter: nextCounter < 9999 ? nextCounter : state.counter,
          };
        }),

      decrement: () =>
        set((state) => ({
          counter: state.counter > 0 ? state.counter - 1 : 0,
        })),

      reset: () => set({ counter: 0 }),

      setTarget: (target) => set({ target }),

      toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),

      setMode: (mode) => set({ mode }),

      setActiveDzikir: (name) => set({ activeDzikir: name }),

      toggleAssist: () => set((state) => ({ isAssistActive: !state.isAssistActive })),

      setAssistCategory: (categoryId) => set({ assistCategoryId: categoryId, activeDzikirId: null, counter: 0 }),

      setAssistDzikir: (dzikirId) => set({ activeDzikirId: dzikirId, counter: 0 }),
    }),
    {
      name: "dzikir-storage",
    }
  )
);
