import { useEffect, useState } from 'react';
import { Eye, ThumbsUp, Play, CheckCircle2, Filter } from 'lucide-react';
import { getLatestVideos, formatNumber, formatDate, type YouTubeVideo } from '../lib/youtube';
import { getWatchedVideos, markVideoAsWatched } from '../lib/watchHistory';

type SortOption = 'date' | 'views' | 'unwatched';

export function VideosPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('unwatched');

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    const [latestVideos, watched] = await Promise.all([
      getLatestVideos(50),
      getWatchedVideos()
    ]);
    setVideos(latestVideos);
    setWatchedVideos(watched);
    setLoading(false);
  }

  function getSortedVideos(): YouTubeVideo[] {
    const videosCopy = [...videos];

    switch (sortBy) {
      case 'unwatched':
        return videosCopy.sort((a, b) => {
          const aWatched = watchedVideos.has(a.id);
          const bWatched = watchedVideos.has(b.id);
          if (aWatched === bWatched) return 0;
          return aWatched ? 1 : -1;
        });
      case 'views':
        return videosCopy.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));
      case 'date':
      default:
        return videosCopy.sort((a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }
  }

  function handleVideoClick(videoId: string) {
    markVideoAsWatched(videoId);
    setWatchedVideos(prev => new Set(prev).add(videoId));
  }

  const sortedVideos = getSortedVideos();
  const unwatchedCount = videos.filter(v => !watchedVideos.has(v.id)).length;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            Tüm Videolar
          </h1>
          <p className="text-zinc-400 text-lg">
            Underground elektrik projeleri ve eğitim içeriklerimiz
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="w-4 h-4 text-green-500" />
              <span className="text-zinc-400">Sırala:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('unwatched')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                  sortBy === 'unwatched'
                    ? 'bg-green-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                İzlenmeyenler Önce
              </button>
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                  sortBy === 'date'
                    ? 'bg-green-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                Tarih
              </button>
              <button
                onClick={() => setSortBy('views')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                  sortBy === 'views'
                    ? 'bg-green-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                İzlenme
              </button>
            </div>
          </div>

          {unwatchedCount > 0 && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <span className="text-green-500 font-bold">{unwatchedCount}</span>
              <span className="text-zinc-400 text-sm">izlenmemiş video</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-zinc-800 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-zinc-800 rounded mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : sortedVideos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-lg">Henüz video yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                isWatched={watchedVideos.has(video.id)}
                onVideoClick={handleVideoClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({
  video,
  index,
  isWatched,
  onVideoClick
}: {
  video: YouTubeVideo;
  index: number;
  isWatched: boolean;
  onVideoClick: (videoId: string) => void;
}) {
  return (
    <a
      href={`https://youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onVideoClick(video.id)}
      className="group opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`relative overflow-hidden rounded-lg mb-4 aspect-video bg-zinc-900 border border-zinc-800 group-hover:border-green-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20 ${
        isWatched ? 'ring-2 ring-green-500/20' : ''
      }`}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            isWatched ? 'opacity-60' : ''
          }`}
          loading="lazy"
        />
        {isWatched && (
          <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-zinc-950" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-8 h-8 text-zinc-950 ml-1" />
          </div>
        </div>
      </div>
      <h3 className={`text-base font-semibold mb-2 group-hover:text-green-500 transition-colors line-clamp-2 ${
        isWatched ? 'text-zinc-400' : 'text-zinc-100'
      }`}>
        {video.title}
      </h3>
      <div className="flex items-center space-x-4 text-xs text-zinc-400">
        <span className="flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>{formatNumber(video.viewCount)}</span>
        </span>
        <span className="flex items-center space-x-1">
          <ThumbsUp className="w-3 h-3" />
          <span>{formatNumber(video.likeCount)}</span>
        </span>
        <span>{formatDate(video.publishedAt)}</span>
      </div>
    </a>
  );
}
