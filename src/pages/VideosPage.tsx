import { useEffect, useState } from 'react';
import { Eye, ThumbsUp, Play, CheckCircle2, Filter } from 'lucide-react';
import { getLatestVideos, formatNumber, formatDate, type YouTubeVideo } from '../lib/youtube';
import { getWatchedVideos, markVideoAsWatched } from '../lib/watchHistory';
import { PageLayout } from '../components/PageLayout';

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
    <PageLayout
      title="Arşivdeki tüm videolar"
      description="Underground elektrik projeleri, eğitimler ve sahne arkası kayıtlar tek listede. Filtreleyip kaldığınız yerden devam edin."
      eyebrow="Video Koleksiyonu"
      actions={[{ label: 'Video fikirlerinizi paylaşın', href: '/video-fikirleri' }]}
    >
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-sm">
            <Filter className="w-4 h-4 text-green-400" />
            <span className="text-zinc-400">Sırala:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy('unwatched')}
              className={`rounded-xl border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                sortBy === 'unwatched'
                  ? 'border-green-400/60 bg-green-500/20 text-green-100'
                  : 'border-white/5 bg-white/5 text-zinc-300 hover:border-white/20'
              }`}
            >
              İzlenmeyenler Önce
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`rounded-xl border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                sortBy === 'date'
                  ? 'border-green-400/60 bg-green-500/20 text-green-100'
                  : 'border-white/5 bg-white/5 text-zinc-300 hover:border-white/20'
              }`}
            >
              Tarih
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`rounded-xl border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                sortBy === 'views'
                  ? 'border-green-400/60 bg-green-500/20 text-green-100'
                  : 'border-white/5 bg-white/5 text-zinc-300 hover:border-white/20'
              }`}
            >
              İzlenme
            </button>
          </div>
        </div>

        {unwatchedCount > 0 && (
          <div className="flex items-center space-x-2 rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-2">
            <span className="text-green-400 font-bold">{unwatchedCount}</span>
            <span className="text-zinc-300 text-sm">izlenmemiş video</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-video rounded-2xl bg-white/5" />
              <div className="h-4 bg-white/5 rounded" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
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
    </PageLayout>
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
      <div className={`relative overflow-hidden rounded-2xl mb-4 aspect-video bg-white/5 border border-white/10 group-hover:border-green-400/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20 ${
        isWatched ? 'ring-2 ring-green-500/30' : ''
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
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-green-500/40">
            <Play className="w-8 h-8 text-zinc-950 ml-1" />
          </div>
        </div>
      </div>
      <h3 className={`text-base font-semibold mb-2 group-hover:text-green-400 transition-colors line-clamp-2 ${
        isWatched ? 'text-zinc-400' : 'text-white'
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
