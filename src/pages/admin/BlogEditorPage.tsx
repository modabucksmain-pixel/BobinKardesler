import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, FileText } from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  status: 'draft' | 'published';
}

export function BlogEditorPage({ postId }: { postId?: string }) {
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user && postId) {
      loadPost();
    }
  }, [user, authLoading, postId]);

  async function loadPost() {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (data) {
      setPost({
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || '',
        featured_image: data.featured_image || '',
        status: data.status,
      });
    }
    setLoading(false);
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  async function handleSave(status: 'draft' | 'published') {
    setError('');

    if (!post.title.trim()) {
      setError('Başlık zorunludur.');
      return;
    }

    if (!post.content.trim()) {
      setError('İçerik zorunludur.');
      return;
    }

    setSaving(true);

    const slug = (post.slug || generateSlug(post.title)).trim();

    if (!slug) {
      setError('Slug oluşturulamadı. Lütfen başlık girin ya da slug alanını doldurun.');
      setSaving(false);
      return;
    }

    const readingTime = calculateReadingTime(post.content);
    const now = new Date().toISOString();

    const postData = {
      title: post.title.trim(),
      slug,
      content: post.content.trim(),
      excerpt: post.excerpt?.trim() || null,
      featured_image: post.featured_image || null,
      status,
      reading_time: readingTime,
      author_id: user?.id,
      updated_at: now,
      ...(status === 'published' && !post.id ? { published_at: now } : {}),
    };

    try {
      if (post.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (!error) {
          alert('Yazı güncellendi!');
          window.location.href = '/admin/blog';
        } else {
          setError('Hata: ' + error.message);
        }
      } else {
        const { error } = await supabase.from('blog_posts').insert(postData);

        if (!error) {
          alert('Yazı kaydedildi!');
          window.location.href = '/admin/blog';
        } else {
          setError('Hata: ' + error.message);
        }
      }
    } catch (err) {
      console.error('Blog kaydedilirken hata oluştu', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
            <div className="h-12 bg-zinc-800 rounded"></div>
            <div className="h-96 bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <a
            href="/admin/blog"
            className="inline-flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm md:text-base">Blog Listesine Dön</span>
          </a>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-4xl font-bold text-green-500 glow-text">
              {post.id ? 'Yazıyı Düzenle' : 'Yeni Yazı Oluştur'}
            </h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                <FileText className="w-4 h-4" />
                <span>Taslak Olarak Kaydet</span>
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50 text-sm md:text-base"
              >
                <Save className="w-4 h-4" />
                <span>Yayınla</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Başlık</label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setPost((prev) => {
                  if (!prev.id) {
                    return { ...prev, title: newTitle, slug: generateSlug(newTitle) };
                  }
                  return { ...prev, title: newTitle };
                });
              }}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 text-xl font-semibold transition-colors"
              placeholder="Yazı başlığı..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
              placeholder="yazi-url-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Özet (Önizleme)
            </label>
            <textarea
              value={post.excerpt}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors resize-none"
              placeholder="Yazının kısa özeti..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Öne Çıkan Görsel URL
            </label>
            <input
              type="url"
              value={post.featured_image}
              onChange={(e) => setPost({ ...post, featured_image: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              İçerik (HTML destekli)
            </label>
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              rows={20}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 font-mono text-sm transition-colors resize-y min-h-[300px]"
              placeholder="<p>Yazı içeriği...</p>"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
