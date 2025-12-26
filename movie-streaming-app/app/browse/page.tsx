/**
 * Browse Page
 * Shows all available categories and tabs
 */

import { getTabSections, extractSubjects } from '@/lib/api-client';
import MovieRow from '@/components/MovieRow';

export const revalidate = 3600; // Revalidate every hour

export default async function BrowsePage() {
  // Fetch all tabs
  const tabPromises = Array.from({ length: 8 }, (_, i) => 
    getTabSections(i).catch(() => [])
  );
  const allTabs = await Promise.all(tabPromises);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Browse All Categories</h1>

      {allTabs.map((sections, tabIndex) => 
        sections.map((section, sectionIndex) => {
          const subjects = extractSubjects(section);
          return subjects.length > 0 ? (
            <MovieRow
              key={`tab${tabIndex}-section${sectionIndex}`}
              title={section.title}
              items={subjects}
            />
          ) : null;
        })
      )}
    </div>
  );
}
