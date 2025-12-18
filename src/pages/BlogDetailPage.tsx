import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Eye, ArrowLeft } from 'lucide-react';
import { formatDate } from '../lib/youtube';
import { SEO } from '../components/SEO';
import { BlogComments } from '../components/BlogComments';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  reading_time: number;
  views: number;
  updated_at: string;
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  async function loadPost() {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (data) {
      setPost(data);
      await supabase
        .from('blog_posts')
        .update({ views: data.views + 1 })
        .eq('id', data.id);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-zinc-800 rounded mb-4"></div>
            <div className="h-6 bg-zinc-800 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-zinc-800 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-green-500 mb-4">Yazı Bulunamadı</h1>
            <p className="text-zinc-400 mb-8">Aradığınız yazı bulunamadı.</p>
            <a
              href="/blog"
              className="inline-flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Blog'a Dön</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const currentUrl = `${window.location.origin}/blog/${slug}`;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO
        title={`${post.title} - Bobin Kardeşler`}
        description={post.excerpt || post.title}
        image={post.featured_image || undefined}
        url={currentUrl}
        type="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href="/blog"
          className="inline-flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Blog'a Dön</span>
        </a>

        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.published_at)}</span>
            </span>
            {post.reading_time > 0 && (
              <span className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time} dakika okuma</span>
              </span>
            )}
            <span className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{post.views} görüntülenme</span>
            </span>
          </div>
        </header>

        {post.featured_image && (
          <div className="mb-12 rounded-lg overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none prose-headings:text-green-500 prose-a:text-green-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-zinc-100 prose-code:text-green-500 prose-code:bg-zinc-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <BlogComments blogPostId={post.id} />
      </article>
    </div>
  );
}
