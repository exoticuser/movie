/**
 * Search Page
 * Allows users to search for movies and series
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Subject } from '@/lib/api-client';
import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&perPage=50`);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [query]);

  return (
    <>
      {/* Results header */}
      {query && (
        <h1 className="mb-6 text-2xl font-bold text-white">
          Search results for &quot;{query}&quot;
        </h1>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-500/10 p-4 text-center text-red-500">
          {error}
        </div>
      )}

      {/* Results grid */}
      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((item) => (
            <MovieCard key={item.subjectId} subject={item} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && !error && query && results.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-lg">No results found for &quot;{query}&quot;</p>
          <p className="mt-2">Try searching with different keywords</p>
        </div>
      )}

      {/* Initial state - no query */}
      {!query && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-lg">Enter a search term to find movies and series</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar for mobile */}
      <div className="mb-8 md:hidden">
        <SearchBar />
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
