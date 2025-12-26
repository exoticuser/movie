/**
 * API client for MovieBox API
 * Provides typed functions for accessing movie/series data
 */

import { BASE_URL, makeHeaders } from './api-auth';

export interface Subject {
  subjectId: string;
  title: string;
  posterUrl?: string;
  coverUrl?: string;
  year?: number;
  rating?: number;
  category?: string;
  summary?: string;
  imdbRating?: string;
}

export interface Section {
  title: string;
  subjects?: Subject[];
  customData?: {
    items?: Array<{ subject?: Subject }>;
  };
}

export interface TabData {
  data?: {
    items?: Section[];
  };
}

export interface SearchResult {
  data?: {
    results?: Array<{
      subjects?: Subject[];
    }>;
  };
}

export interface Stream {
  url?: string;
  format?: string;
  resolutions?: string[];
  codecName?: string;
  signCookie?: string;
}

export interface PlayInfo {
  data?: {
    streams?: Stream[];
  };
}

/**
 * Make authenticated GET request
 */
export async function apiGet<T>(url: string): Promise<T> {
  const headers = makeHeaders('GET', url);
  const response = await fetch(url, {
    method: 'GET',
    headers,
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Make authenticated POST request
 */
export async function apiPost<T>(url: string, body: string): Promise<T> {
  const headers = makeHeaders('POST', url, body);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get sections from a tab
 */
export async function getTabSections(tabId: number): Promise<Section[]> {
  const url = `${BASE_URL}/wefeed-mobile-bff/tab-operating?page=1&tabId=${tabId}&version=`;
  const data = await apiGet<TabData>(url);
  return data.data?.items || [];
}

/**
 * Extract subjects from a section
 */
export function extractSubjects(section: Section): Subject[] {
  const subjects: Subject[] = [];
  
  if (section.subjects) {
    subjects.push(...section.subjects);
  }
  
  if (section.customData?.items) {
    for (const item of section.customData.items) {
      if (item.subject) {
        subjects.push(item.subject);
      }
    }
  }
  
  return subjects;
}

/**
 * Search for movies/series
 */
export async function searchContent(
  keyword: string,
  page: number = 1,
  perPage: number = 20
): Promise<Subject[]> {
  const url = `${BASE_URL}/wefeed-mobile-bff/subject-api/search/v2`;
  const body = JSON.stringify({ page, perPage, keyword });
  const data = await apiPost<SearchResult>(url, body);
  
  const subjects: Subject[] = [];
  const results = data.data?.results || [];
  
  for (const group of results) {
    if (group.subjects) {
      subjects.push(...group.subjects);
    }
  }
  
  return subjects;
}

/**
 * Get play info (streaming links) for a subject
 */
export async function getPlayInfo(
  subjectId: string,
  season: number = 0,
  episode: number = 0
): Promise<Stream[]> {
  const url = `${BASE_URL}/wefeed-mobile-bff/subject-api/play-info?subjectId=${subjectId}&se=${season}&ep=${episode}`;
  const data = await apiGet<PlayInfo>(url);
  return data.data?.streams || [];
}

/**
 * Get all available tabs and their content
 */
export async function getAllTabs(): Promise<Record<number, Section[]>> {
  const tabs: Record<number, Section[]> = {};
  
  // Check tabs 0-7 as per a.py
  for (let tabId = 0; tabId <= 7; tabId++) {
    try {
      const sections = await getTabSections(tabId);
      if (sections.length > 0) {
        tabs[tabId] = sections;
      }
    } catch (error) {
      console.error(`Failed to fetch tab ${tabId}:`, error);
    }
  }
  
  return tabs;
}
