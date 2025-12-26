/**
 * SearchBar Component
 * Provides search functionality with debouncing
 */

'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function SearchBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, router]);

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies and series..."
          className="w-full rounded-full border border-gray-700 bg-gray-800/50 px-4 py-2 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search movies and series..."
            className="w-full rounded-full border border-gray-700 bg-gray-800/50 px-4 py-2 pl-10 text-white placeholder-gray-400"
            disabled
          />
        </div>
      </div>
    }>
      <SearchBarInner />
    </Suspense>
  );
}
