'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, BookOpen, Loader2, X } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchVerses } from '@/lib/api';
import { SearchResultItem } from '@/components/quran/SearchResultItem';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 350);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const { 
    data, 
    isLoading, 
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ pageParam = 1 }) => searchVerses(debouncedQuery, pageParam),
    initialPageParam: 1,
    enabled: debouncedQuery.length > 2,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.search;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const allResults = data?.pages.flatMap(page => page.search.results) || [];
  const totalResults = data?.pages[0]?.search.total_results || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">Cari Ayat</h1>
        <p className="text-muted-foreground">Cari ayat berdasarkan isi teks Arab atau terjemahan Indonesia</p>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {(isFetching && !isFetchingNextPage) ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <SearchIcon className="w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            )}
          </div>
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik kata kunci (misal: 'sabar', 'shalat', 'الحمد')..."
            className="w-full pl-11 pr-11 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg shadow-sm group-hover:shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      <section className="space-y-4">
        {debouncedQuery.length > 0 && debouncedQuery.length <= 2 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ketik minimal 3 karakter untuk mencari...
          </p>
        )}

        {debouncedQuery.length > 2 && totalResults > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1 mb-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              {totalResults.toLocaleString()} Ayat ditemukan
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {allResults.map((result) => (
            <SearchResultItem key={result.verse_key} result={result} />
          ))}
        </div>
        
        {/* Infinite Scroll Target */}
        <div ref={observerTarget} className="h-10 w-full" />

        {(isLoading || isFetchingNextPage) && debouncedQuery.length > 2 && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && allResults.length === 0 && debouncedQuery.length > 2 && (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
            <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Tidak ada ayat yang cocok dengan "{debouncedQuery}"</p>
          </div>
        )}
        
        {!searchQuery && (
          <div className="text-center py-20 opacity-50">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">Gunakan kolom di atas untuk mencari topik tertentu</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                <button onClick={() => setSearchQuery('sabar')} className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-sm transition-colors border border-border">#sabar</button>
                <button onClick={() => setSearchQuery('syukur')} className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-sm transition-colors border border-border">#syukur</button>
                <button onClick={() => setSearchQuery('taqwa')} className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-sm transition-colors border border-border">#taqwa</button>
                <button onClick={() => setSearchQuery('shalat')} className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-sm transition-colors border border-border">#shalat</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
