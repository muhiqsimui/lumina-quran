import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeQuranText(text: string): string {
  if (!text) return text;

  // 1. Remove Fatha (U+064E) before Small Alif (U+0670) 
  let normalized = text.replace(/\u064E\u0670/g, '\u0670');

  return normalized;
}

export function removeArabicDiacritics(text: string): string {
  if (!text) return text;
  // Arabic diacritics: Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun
  // Plus some Quranic specific marks like small alif, etc.
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}


export function getArabicFontClass(fontId: string): string {
  switch (fontId) {
    case "uthman-hafs":
      return "font-hafs";
    case "uthman-naskh":
      return "font-naskh";
    case "lpmq":
      return "font-lpmq";
    case "amiri":
      return "font-amiri";
    default:
      return "font-hafs";
  }
}
