import { NextResponse } from 'next/server';
import { getTabSections } from '@/lib/api-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tabId = searchParams.get('tabId');

  if (!tabId) {
    return NextResponse.json(
      { error: 'tabId is required' },
      { status: 400 }
    );
  }

  try {
    const sections = await getTabSections(parseInt(tabId, 10));
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching tab sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tab sections' },
      { status: 500 }
    );
  }
}
