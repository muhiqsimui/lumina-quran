"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Search, Settings, Book, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SettingsModal } from "../SettingsModal";

const navItems = [
  { icon: Home, label: "Beranda", href: "/" },
  { icon: Search, label: "Cari", href: "/search" },
  { icon: Book, label: "Surah", href: "/surah" },
  { icon: Bookmark, label: "Simpan", href: "/bookmarks" },
  { icon: CircleDot, label: "Dzikir", href: "/dzikir" },
  { icon: Settings, label: "Pengaturan", href: null },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex items-center justify-around h-16 px-4 bg-background/80 backdrop-blur-lg border-t border-border">
          {navItems.map((item) => {
            const isActive = pathname === item.href && item.href !== null;
            const Icon = item.icon;

            if (item.href === null) {
              return (
                <button
                  key="settings"
                  onClick={() => setIsSettingsOpen(true)}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium mt-1">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                <span className="text-[10px] font-medium mt-1">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
