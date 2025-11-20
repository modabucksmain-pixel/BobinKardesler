import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '../lib/youtube';
import { PageLayout } from '../components/PageLayout';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  slug: string;
  published_at: string;
  reading_time: number;
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt, featured_image, slug, published_at, reading_time')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  }

  return (
    <PageLayout
      title="Atölyeden ve masadan notlar"
      description="Elektrik tasarımları, üretim günlükleri ve topluluk hikâyeleri. Uzun okuma seviyorsanız kahvenizi hazır edin."
      eyebrow="Blog"
      actions={[{ label: 'Video içeriklere dön', href: '/videos' }]}
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="h-52 rounded-2xl bg-white/5" />
              <div className="h-4 rounded bg-white/5" />
              <div className="h-3 rounded bg-white/5 w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">Henüz yazı yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group block opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl mb-4 bg-white/5 border border-white/10 group-hover:border-green-400/30 transition-all duration-300 shadow-lg shadow-green-500/5">
        <div className="aspect-[16/10] bg-gradient-to-br from-green-500/20 via-zinc-900 to-emerald-500/20">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-500">Kapak görseli yok</div>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-sm text-zinc-400">
          <span className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.published_at)}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{post.reading_time} dk</span>
          </span>
        </div>
        <h3 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-zinc-300 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center space-x-2 text-green-400 font-semibold">
          <span>Devamını oku</span>
          <span className="transform transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </a>
  );
}
