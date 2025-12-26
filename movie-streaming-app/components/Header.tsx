/**
 * Navigation Header Component
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/category/movies' },
    { name: 'Series', href: '/category/series' },
    { name: 'Browse', href: '/browse' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-500">
            🎬 MovieStream
          </Link>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden space-x-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-blue-500 ${
                  pathname === item.href ? 'text-blue-500' : 'text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Hidden on mobile, shown in dedicated search page */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Mobile menu button */}
          <Link
            href="/search"
            className="rounded-full bg-gray-800 p-2 text-gray-300 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
