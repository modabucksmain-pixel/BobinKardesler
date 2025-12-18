import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, FileText } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

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
  const { success, error: showError, info } = useNotification();
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
  const draftKey = postId ? `blog-editor-${postId}` : 'blog-editor-new';

  const wordCount = useMemo(() => {
    if (!post.content.trim()) return 0;
    return post.content.trim().split(/\s+/).length;
  }, [post.content]);

  const readingTime = useMemo(() => calculateReadingTime(post.content), [post.content]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user && postId) {
      loadPost();
    } else if (!authLoading && user) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft) as BlogPost;
          setPost(parsed);
          info('Kaydedilmemiş taslak geri yüklendi');
        } catch (e) {
          console.error('Taslak yüklenemedi', e);
        }
      }
    }
  }, [user, authLoading, postId, draftKey, info]);

  useEffect(() => {
    if (!authLoading && user && !postId) {
      localStorage.setItem(draftKey, JSON.stringify(post));
    }
  }, [post, draftKey, authLoading, user, postId]);

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

    const calculatedReadingTime = readingTime;
    const now = new Date().toISOString();

    const postData = {
      title: post.title.trim(),
      slug,
      content: post.content.trim(),
      excerpt: post.excerpt?.trim() || null,
      featured_image: post.featured_image || null,
      status,
      reading_time: calculatedReadingTime,
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
          success('Yazı güncellendi');
          localStorage.removeItem(draftKey);
          window.location.href = '/admin/blog';
        } else {
          setError('Hata: ' + error.message);
          showError('Yazı güncellenemedi: ' + error.message);
        }
      } else {
        const { error } = await supabase.from('blog_posts').insert(postData);

        if (!error) {
          success('Yeni yazı kaydedildi');
          localStorage.removeItem(draftKey);
          window.location.href = '/admin/blog';
        } else {
          setError('Hata: ' + error.message);
          showError('Yazı kaydedilemedi: ' + error.message);
        }
      }
    } catch (err) {
      console.error('Blog kaydedilirken hata oluştu', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      showError('Kaydetme sırasında hata oluştu');
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

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-zinc-400">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <FileText className="w-4 h-4 text-green-400" />
              <span>{wordCount} kelime</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <Save className="w-4 h-4 text-green-400" />
              <span>Tahmini okuma süresi: {readingTime} dk</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-500">URL:</span>
              <code className="text-green-400">/blog/{post.slug || generateSlug(post.title) || 'yeni-yazi'}</code>
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
            <p className="mt-1 text-xs text-zinc-500">Başlık ve otomatik slug kaydedilip geri yüklenir.</p>
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
            <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
              <span>{post.excerpt.length || 0} karakter</span>
              <span>Önerilen: 140-200 karakter</span>
            </div>
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
            <p className="mt-1 text-xs text-zinc-500">(Opsiyonel) Görsel eklemezseniz varsayılan kapak kullanılır.</p>
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
            <div className="flex items-center justify-between text-xs text-zinc-500 mt-1">
              <span>{wordCount} kelime</span>
              <span>~{readingTime} dk okuma</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-zinc-100 mb-2">Taslak Önizleme</h2>
              <p className="text-sm text-zinc-500 mb-3">Bu alan canlı olarak güncellenir ve ana sayfada nasıl görüneceğini gösterir.</p>
              <div className="space-y-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                  {post.featured_image ? (
                    <img src={post.featured_image} alt="Öne çıkan" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">Görsel seçilmedi</div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-zinc-50">{post.title || 'Başlık bekleniyor'}</h3>
                <p className="text-sm text-zinc-400 line-clamp-3">{post.excerpt || 'Özet eklediğinizde burada görünecek.'}</p>
                <div className="text-xs text-zinc-500">Tahmini okuma süresi: {readingTime} dk</div>
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-zinc-100 mb-2">Yayın Notları</h2>
              <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                <li>Slug otomatik oluşturulur, dilerseniz düzenleyebilirsiniz.</li>
                <li>Kaydetmeden çıkarsanız taslaklar otomatik olarak saklanır.</li>
                <li>Yayınlanan yazılar ana sayfa ve blog listesinde görünecektir.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
