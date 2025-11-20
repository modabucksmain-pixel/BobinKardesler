import { useEffect, useState } from 'react';
import { Search, Play, FileText, Eye, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getLatestVideos, type YouTubeVideo, formatNumber, formatDate } from '../lib/youtube';
import { SearchBar } from '../components/SearchBar';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  views: number;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, []);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) {
      setVideos([]);
      setBlogPosts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const searchLower = searchQuery.toLowerCase();

    const [allVideos, blogData] = await Promise.all([
      getLatestVideos(50),
      supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, published_at, views')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
    ]);

    const filteredVideos = allVideos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchLower) ||
        video.description.toLowerCase().includes(searchLower)
    );

    const filteredBlogs = (blogData.data || []).filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchLower))
    );

    setVideos(filteredVideos);
    setBlogPosts(filteredBlogs);
    setLoading(false);
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const newUrl = searchQuery ? `${window.location.pathname}?q=${encodeURIComponent(searchQuery)}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    performSearch(searchQuery);
  };

  const totalResults = videos.length + blogPosts.length;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-6">
            <Search className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            Ara
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Videolar ve blog yazıları arasında arama yapın
          </p>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Video veya blog ara..."
            className="max-w-2xl mx-auto"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-400">Aranıyor...</p>
          </div>
        ) : hasSearched ? (
          <>
            <div className="mb-8">
              <p className="text-zinc-400">
                <span className="text-green-500 font-bold">{totalResults}</span> sonuç bulundu
                {query && (
                  <>
                    {' '}
                    &quot;<span className="text-zinc-100">{query}</span>&quot; için
                  </>
                )}
              </p>
            </div>

            {videos.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center space-x-2">
                  <Play className="w-6 h-6 text-green-500" />
                  <span>Videolar ({videos.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}

            {blogPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-green-500" />
                  <span>Blog Yazıları ({blogPosts.length})</span>
                </h2>
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-20 bg-zinc-900/30 rounded-lg border border-zinc-800">
                <Search className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 text-lg mb-2">Sonuç bulunamadı</p>
                <p className="text-zinc-500 text-sm">
                  Farklı anahtar kelimeler ile tekrar deneyin
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">
              Arama yapmak için yukarıdaki kutuyu kullanın
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: YouTubeVideo }) {
  return (
    <a
      href={`https://youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-green-500/40 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-zinc-950 ml-1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-zinc-100 mb-2 group-hover:text-green-500 transition-colors line-clamp-2">
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
      </div>
    </a>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group block bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-green-500/40 transition-all duration-300"
    >
      <h3 className="text-xl font-semibold text-zinc-100 mb-2 group-hover:text-green-500 transition-colors">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
      )}
      <div className="flex items-center space-x-4 text-xs text-zinc-500">
        <span className="flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>{post.views} görüntülenme</span>
        </span>
        <span>{new Date(post.published_at).toLocaleDateString('tr-TR')}</span>
      </div>
    </a>
  );
}
