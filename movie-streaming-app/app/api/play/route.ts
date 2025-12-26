import { NextResponse } from 'next/server';
import { getPlayInfo } from '@/lib/api-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subjectId');
  const season = parseInt(searchParams.get('season') || '0', 10);
  const episode = parseInt(searchParams.get('episode') || '0', 10);

  if (!subjectId) {
    return NextResponse.json(
      { error: 'subjectId is required' },
      { status: 400 }
    );
  }

  try {
    const streams = await getPlayInfo(subjectId, season, episode);
    
    // Sort streams: MP4 first, then HLS, then others
    const sortedStreams = [...streams].sort((a, b) => {
      const urlA = (a.url || '').toLowerCase();
      const urlB = (b.url || '').toLowerCase();
      
      if (urlA.includes('.mp4') && !urlB.includes('.mp4')) return -1;
      if (!urlA.includes('.mp4') && urlB.includes('.mp4')) return 1;
      if (urlA.includes('m3u8') && !urlB.includes('m3u8')) return -1;
      if (!urlA.includes('m3u8') && urlB.includes('m3u8')) return 1;
      
      return 0;
    });

    return NextResponse.json({ streams: sortedStreams });
  } catch (error) {
    console.error('Error fetching play info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch play info' },
      { status: 500 }
    );
  }
}
