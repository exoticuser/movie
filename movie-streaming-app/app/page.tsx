/**
 * Home Page
 * Displays featured movies and series from various tabs
 */

import { getTabSections, extractSubjects } from '@/lib/api-client';
import MovieRow from '@/components/MovieRow';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  // Fetch content from multiple tabs
  const [tab0, tab1, tab2] = await Promise.all([
    getTabSections(0).catch(() => []),
    getTabSections(1).catch(() => []),
    getTabSections(2).catch(() => []),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center md:p-12">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
          Welcome to MovieStream
        </h1>
        <p className="mb-6 text-lg text-white/90 md:text-xl">
          Stream unlimited movies and series in HD quality. No login required!
        </p>
      </section>

      {/* Content Sections from Tab 0 */}
      {tab0.map((section, index) => {
        const subjects = extractSubjects(section);
        return subjects.length > 0 ? (
          <MovieRow key={`tab0-${index}`} title={section.title} items={subjects} />
        ) : null;
      })}

      {/* Content Sections from Tab 1 */}
      {tab1.map((section, index) => {
        const subjects = extractSubjects(section);
        return subjects.length > 0 ? (
          <MovieRow key={`tab1-${index}`} title={section.title} items={subjects} />
        ) : null;
      })}

      {/* Content Sections from Tab 2 */}
      {tab2.map((section, index) => {
        const subjects = extractSubjects(section);
        return subjects.length > 0 ? (
          <MovieRow key={`tab2-${index}`} title={section.title} items={subjects} />
        ) : null;
      })}
    </div>
  );
}
