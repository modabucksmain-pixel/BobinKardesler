import { useEffect, useState } from 'react';
import { ArrowRight, FolderOpen, Sparkles } from 'lucide-react';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import { getForumCategoriesWithForums, getLatestThreads, type ForumCategory, type ForumForum } from '../../lib/forum';
import { navigate } from '../../lib/navigation';

export function ForumLandingPage() {
  const [categories, setCategories] = useState<(ForumCategory & { forums: ForumForum[] })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Forum | Bobin Kardeşler';
    document.body.dataset.forumTheme = (localStorage.getItem('bk-forum-theme') as 'dark' | 'light' | null) ?? 'light';
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data, error: fetchError } = await getForumCategoriesWithForums();
    if (fetchError || !data) {
      setError('Forum kategorileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    } else {
      setCategories(data);
      setError(null);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-12" style={{ backgroundColor: 'var(--background-color)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm forum-card">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">Forum</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">Anasayfa</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {[
                { label: 'Anasayfa', path: '/' },
                { label: 'Sosyal', path: '/forum/kategori/sosyal' },
                { label: 'Yeni mesajlar', path: '/forum/son-konular' },
                { label: 'Cevapsız sorular', path: '/forum/konu/cevapsiz' },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="rounded-lg border border-transparent px-3 py-2 text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.label}
                </button>
              ))}
              <div className="h-6 w-px bg-slate-200" aria-hidden />
              <ForumThemeToggle />
            </div>
          </div>

          <header className="forum-card forum-hero rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 forum-chip">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Google doğrulamalı topluluk forumu</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                    Kategori ve alt forumlarla SEO uyumlu yeni forum deneyimi
                  </h1>
                  <p className="forum-muted text-base sm:text-lg leading-relaxed max-w-3xl">
                    Technopat tarzı hiyerarşi, okunabilir URL yapıları ve admin kontrollü güvenlik katmanlarıyla tasarlanmış forum
                    bölümü. İlgili kategoriyi seç, alt forumu aç ve detay sayfasına yönlen.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <button
                    onClick={() => navigate('/forum/son-konular')}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-800 hover:bg-white"
                  >
                    Son Konulara Git
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate('/forum/kategori/duyurular/site-duyurulari')}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
                  >
                    Kuralları Oku
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="hidden sm:block">
                <ForumThemeToggle />
              </div>
            </div>
          </header>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-6">
            <div className="forum-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Yeni konular</h2>
                  <p className="forum-muted text-sm">Tüm alt forumlardan güncel başlıklar</p>
                </div>
                <button
                  onClick={() => navigate('/forum/son-konular')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-white"
                >
                  Tümünü Gör <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="divide-y divide-slate-200">
                {getLatestThreads(8).map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => navigate(`/forum/konu/${thread.slug || thread.id}-${thread.id}`)}
                    className="flex w-full flex-col gap-1 py-4 text-left transition hover:bg-slate-50"
                  >
                    <p className="text-xs font-medium text-emerald-700">
                      {thread.category?.name} / {thread.forum?.name}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{thread.title}</h3>
                    <p className="forum-muted text-sm line-clamp-2">{thread.body}</p>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-36 rounded-2xl border border-slate-200 bg-white animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
                Henüz tanımlı kategori yok. Admin panelinden yeni kategori ekleyin.
              </div>
            ) : (
              <div className="grid gap-4">
                {categories.map((category) => (
                  <article
                    key={category.id}
                    className="forum-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="forum-chip inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          <FolderOpen className="h-4 w-4" />
                          Kategori
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{category.name}</h2>
                        {category.description && <p className="forum-muted">{category.description}</p>}
                      </div>
                      <button
                        onClick={() => navigate(`/forum/kategori/${category.slug}`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white"
                      >
                        Kategoriyi Aç
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {category.forums.map((forum) => (
                        <button
                          key={forum.id}
                          onClick={() => navigate(`/forum/kategori/${category.slug}/${forum.slug}`)}
                          className="forum-card w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-slate-900">{forum.name}</h3>
                              {forum.description && <p className="text-sm forum-muted">{forum.description}</p>}
                            </div>
                            {typeof forum.thread_count === 'number' && (
                              <span className="forum-chip rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                {forum.thread_count} konu
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="forum-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Benzer konular</h3>
                <span className="text-xs font-medium text-slate-500">Öne çıkanlar</span>
              </div>
              <div className="space-y-3">
                {getLatestThreads(4).map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => navigate(`/forum/konu/${thread.slug || thread.id}-${thread.id}`)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-slate-50"
                  >
                    <p className="text-xs font-medium text-emerald-700">{thread.category?.name}</p>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">{thread.title}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="forum-card rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Sponsor / Banner Alanı</p>
              <p className="forum-muted mt-1 text-sm">Promosyon, duyuru veya kampanyalar için kullanılabilir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
