/**
 * MovieRow Component
 * Displays a horizontal scrollable row of movies/series
 */

'use client';

import { Subject } from '@/lib/api-client';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  items: Subject[];
}

export default function MovieRow({ title, items }: MovieRowProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">{title}</h2>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((item) => (
            <div key={item.subjectId} className="w-32 flex-shrink-0 sm:w-40 md:w-48">
              <MovieCard subject={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
