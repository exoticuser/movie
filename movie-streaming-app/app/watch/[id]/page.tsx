/**
 * Watch Page
 * Displays movie/series details and video player
 */

'use client';

import { useEffect, useState } from 'react';
import { Stream } from '@/lib/api-client';
import VideoPlayer from '@/components/VideoPlayer';

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  const [subjectId, setSubjectId] = useState<string>('');
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState(0);
  const [episode, setEpisode] = useState(0);

  useEffect(() => {
    params.then(p => setSubjectId(p.id));
  }, [params]);

  useEffect(() => {
    if (!subjectId) return;

    const fetchStreams = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/play?subjectId=${subjectId}&season=${season}&episode=${episode}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch streams');
        
        const data = await response.json();
        setStreams(data.streams || []);
        
        // Auto-select first stream
        if (data.streams && data.streams.length > 0) {
          setSelectedStream(data.streams[0]);
        }
      } catch (err) {
        console.error('Error fetching streams:', err);
        setError('Failed to load video streams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, [subjectId, season, episode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-500/10 p-8 text-center text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Video Player */}
      {selectedStream && selectedStream.url && (
        <div className="mb-8">
          <VideoPlayer
            src={selectedStream.url}
            signCookie={selectedStream.signCookie}
          />
        </div>
      )}

      {/* Episode Controls (for series) */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="season" className="text-sm font-medium text-gray-300">
            Season:
          </label>
          <input
            id="season"
            type="number"
            min="0"
            value={season}
            onChange={(e) => setSeason(parseInt(e.target.value, 10))}
            className="w-20 rounded border border-gray-700 bg-gray-800 px-3 py-1 text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="episode" className="text-sm font-medium text-gray-300">
            Episode:
          </label>
          <input
            id="episode"
            type="number"
            min="0"
            value={episode}
            onChange={(e) => setEpisode(parseInt(e.target.value, 10))}
            className="w-20 rounded border border-gray-700 bg-gray-800 px-3 py-1 text-white"
          />
        </div>
      </div>

      {/* Stream Quality Selection */}
      {streams.length > 1 && (
        <div className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Available Streams
          </h3>
          <div className="flex flex-wrap gap-2">
            {streams.map((stream, index) => (
              <button
                key={index}
                onClick={() => setSelectedStream(stream)}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStream === stream
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {stream.format || 'Stream'} {stream.resolutions?.[0] || ''}
                {stream.codecName && ` (${stream.codecName})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stream Info */}
      {selectedStream && (
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Stream Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex">
              <dt className="w-32 font-medium text-gray-400">Format:</dt>
              <dd className="text-white">{selectedStream.format || 'N/A'}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-medium text-gray-400">Codec:</dt>
              <dd className="text-white">{selectedStream.codecName || 'N/A'}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-medium text-gray-400">Resolutions:</dt>
              <dd className="text-white">
                {selectedStream.resolutions?.join(', ') || 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* No streams available */}
      {streams.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-lg">No streams available for this content</p>
        </div>
      )}
    </div>
  );
}
