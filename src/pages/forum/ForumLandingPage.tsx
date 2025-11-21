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
    document.body.dataset.forumTheme = (localStorage.getItem('bk-forum-theme') as 'dark' | 'light' | null) ?? 'dark';
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
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="forum-card forum-hero rounded-2xl border border-green-500/20 bg-zinc-900/60 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/10 text-green-300 text-sm font-semibold forum-chip">
                <Sparkles className="w-4 h-4" />
                <span>Google doğrulamalı topluluk forumu</span>
              </div>
              <ForumThemeToggle />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Kategori ve alt forumlarla SEO uyumlu yeni forum deneyimi
            </h1>
            <p className="forum-muted text-lg leading-relaxed max-w-3xl">
              Technopat tarzı hiyerarşi, okunabilir URL yapıları ve admin kontrollü güvenlik katmanlarıyla tasarlanmış forum bölümü.
              İlgili kategoriyi seç, alt forumu aç ve detay sayfasına yönlen.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <button
                onClick={() => navigate('/forum/son-konular')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:border-green-400/60 hover:text-green-100"
              >
                Son Konulara Git
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/forum/kategori/duyurular/site-duyurulari')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-zinc-950 font-semibold hover:bg-green-400"
              >
                Kuralları Oku
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-40 bg-zinc-800/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-zinc-300">
              Henüz tanımlı kategori yok. Admin panelinden yeni kategori ekleyin.
            </div>
          ) : (
            categories.map((category) => (
              <article
                key={category.id}
                className="forum-card rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="forum-chip inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                      <FolderOpen className="w-4 h-4" />
                      Kategori
                    </div>
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                    {category.description && <p className="forum-muted">{category.description}</p>}
                  </div>
                  <button
                    onClick={() => navigate(`/forum/kategori/${category.slug}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-zinc-950 font-semibold hover:bg-green-400 transition"
                  >
                    Kategoriyi Aç
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-3">
                  {category.forums.map((forum) => (
                    <button
                      key={forum.id}
                      onClick={() => navigate(`/forum/kategori/${category.slug}/${forum.slug}`)}
                      className="forum-card w-full text-left rounded-xl border border-white/10 bg-zinc-900/60 hover:border-green-400/60 hover:bg-zinc-900/90 transition p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-white">{forum.name}</h3>
                          {forum.description && <p className="text-sm forum-muted">{forum.description}</p>}
                        </div>
                        {typeof forum.thread_count === 'number' && (
                          <span className="forum-chip text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">
                            {forum.thread_count} konu
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="forum-card rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Son Konular</h2>
              <p className="forum-muted text-sm">Tüm alt forumlardan güncel başlıklar</p>
            </div>
            <button
              onClick={() => navigate('/forum/son-konular')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-zinc-950 font-semibold hover:bg-green-400"
            >
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {getLatestThreads(6).map((thread) => (
              <button
                key={thread.id}
                onClick={() => navigate(`/forum/konu/${thread.slug || thread.id}-${thread.id}`)}
                className="forum-card text-left rounded-xl border border-white/10 bg-zinc-900/50 hover:border-green-400/60 hover:bg-zinc-900/80 transition p-4"
              >
                <p className="text-xs forum-muted mb-2">{thread.category?.name} / {thread.forum?.name}</p>
                <h3 className="text-lg font-semibold text-white line-clamp-2">{thread.title}</h3>
                <p className="forum-muted text-sm line-clamp-2">{thread.body}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
