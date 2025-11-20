import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '../lib/youtube';

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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            Blog
          </h1>
          <p className="text-zinc-400 text-lg">
            Elektrik, elektronik ve underground teknoloji yazıları
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-zinc-800 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-zinc-800 rounded mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded"></div>
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
      </div>
    </div>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group block opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-green-500/40 transition-all duration-300 h-full flex flex-col">
        {post.featured_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-zinc-100 mb-3 group-hover:text-green-500 transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-zinc-400 text-sm line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-800">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.published_at)}</span>
            </span>
            {post.reading_time > 0 && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{post.reading_time} dk</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
