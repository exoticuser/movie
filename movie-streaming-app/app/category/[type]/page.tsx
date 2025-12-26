/**
 * Category Page
 * Shows movies or series based on category type
 */

import { getTabSections, extractSubjects } from '@/lib/api-client';
import MovieCard from '@/components/MovieCard';

export const revalidate = 3600; // Revalidate every hour

interface CategoryPageProps {
  params: Promise<{
    type: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { type } = await params;
  const categoryName = type === 'movies' ? 'Movies' : 'Series';
  
  // Fetch from relevant tabs
  const sections = await getTabSections(type === 'movies' ? 0 : 1).catch(() => []);
  const allSubjects = sections.flatMap(section => extractSubjects(section));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">{categoryName}</h1>

      {allSubjects.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {allSubjects.map((item) => (
            <MovieCard key={item.subjectId} subject={item} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400">
          <p>No {categoryName.toLowerCase()} available at the moment</p>
        </div>
      )}
    </div>
  );
}
