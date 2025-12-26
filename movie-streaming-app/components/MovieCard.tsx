/**
 * MovieCard Component
 * Displays a movie/series card with poster and basic info
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Subject } from '@/lib/api-client';

interface MovieCardProps {
  subject: Subject;
}

export default function MovieCard({ subject }: MovieCardProps) {
  const posterUrl = subject.posterUrl || subject.coverUrl || '/placeholder.jpg';
  
  return (
    <Link
      href={`/watch/${subject.subjectId}`}
      className="group block overflow-hidden rounded-lg bg-gray-800 transition-transform hover:scale-105 hover:shadow-xl"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={posterUrl}
          alt={subject.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform group-hover:scale-110"
          loading="lazy"
        />
        {subject.year && (
          <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {subject.year}
          </div>
        )}
        {subject.rating && (
          <div className="absolute top-2 left-2 rounded bg-yellow-500/90 px-2 py-1 text-xs font-bold text-black">
            ⭐ {subject.rating}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white md:text-base">
          {subject.title}
        </h3>
        {subject.category && (
          <p className="mt-1 text-xs text-gray-400">{subject.category}</p>
        )}
      </div>
    </Link>
  );
}
