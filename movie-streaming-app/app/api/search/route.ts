import { NextResponse } from 'next/server';
import { searchContent } from '@/lib/api-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '20', 10);

  if (!keyword) {
    return NextResponse.json(
      { error: 'Search query (q) is required' },
      { status: 400 }
    );
  }

  try {
    const results = await searchContent(keyword, page, perPage);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching content:', error);
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    );
  }
}
