import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeQuranText(text: string): string {
  if (!text) return text;

  // 1. Remove Fatha (U+064E) before Small Alif (U+0670) 
  // This is a common issue in some data sources where both are present
  // resulting in overlapping marks (tertimpa).
  let normalized = text.replace(/\u064E\u0670/g, '\u0670');

  return normalized;
}

export function getArabicFontClass(fontId: string): string {
  switch (fontId) {
    case "uthman-hafs":
      return "font-hafs";
    case "uthman-naskh":
      return "font-naskh";
    case "lpmq":
      return "font-lpmq";
    default:
      return "font-hafs";
  }
}
