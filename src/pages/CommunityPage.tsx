import { useEffect, useState } from 'react';
import { MessageSquare, Pin, Eye, Calendar } from 'lucide-react';
import { getCommunityPosts, type CommunityPost } from '../lib/community';
import { formatDate } from '../lib/youtube';

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const data = await getCommunityPosts();
    setPosts(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-block p-3 sm:p-4 bg-green-500/10 rounded-full mb-4 sm:mb-6">
            <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-500 mb-3 sm:mb-4 glow-text px-2">
            Topluluk Duyuruları
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Önemli duyurular, güncellemeler ve topluluk haberleri
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900/50 rounded-lg p-6 h-64"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Henüz duyuru yok.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <CommunityPostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommunityPostCard({ post, index }: { post: CommunityPost; index: number }) {
  return (
    <article
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-green-500/40 transition-all duration-300 animate-scale-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {post.pinned && (
        <div className="bg-green-500/10 border-b border-green-500/20 px-4 sm:px-6 py-2 flex items-center space-x-2">
          <Pin className="w-4 h-4 text-green-500" />
          <span className="text-green-500 text-xs sm:text-sm font-semibold">Sabitlenmiş</span>
        </div>
      )}

      {post.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-3 sm:mb-4 group-hover:text-green-500 transition-colors">
          {post.title}
        </h2>

        <div
          className="prose prose-invert prose-green max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-zinc-400 pt-4 border-t border-zinc-800 gap-2">
          <div className="flex items-center flex-wrap gap-3 sm:gap-4">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.created_at)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views} görüntülenme</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
