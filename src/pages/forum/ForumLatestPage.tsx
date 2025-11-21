import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Filter, Hash, Search } from 'lucide-react';
import { getForumCategoriesWithForums, getLatestThreads, type ForumThread } from '../../lib/forum';
import { navigate } from '../../lib/navigation';

export function ForumLatestPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'last' | 'views' | 'replies'>('last');

  useEffect(() => {
    document.title = 'Son Konular | Forum';
    document.body.dataset.forumTheme = (localStorage.getItem('bk-forum-theme') as 'dark' | 'light' | null) ?? 'dark';
    setThreads(getLatestThreads(50));
  }, []);

  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  useEffect(() => {
    getForumCategoriesWithForums().then(({ data }) => {
      if (!data) return;
      setCategories(data.map((c) => ({ slug: c.slug, name: c.name })));
    });
  }, []);

  const filtered = useMemo(() => {
    return threads
      .filter((thread) => (category === 'all' ? true : thread.category?.slug === category))
      .filter((thread) =>
        search
          ? `${thread.title} ${thread.body} ${thread.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => {
        if (sort === 'views') return (b.view_count ?? 0) - (a.view_count ?? 0);
        if (sort === 'replies') return (b.reply_count ?? 0) - (a.reply_count ?? 0);
        return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
      });
  }, [threads, category, search, sort]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/forum')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-green-400/50 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Forum ana sayfa
          </button>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Filter className="w-4 h-4" />
            SEO uyumlu /forum/son-konular
          </div>
        </div>

        <div className="forum-card rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Son Konular</h1>
              <p className="forum-muted text-sm">Tüm kategorilerden güncel başlıkları filtrele, sırala, ara.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                onClick={() => setSort('last')}
                className={`forum-chip px-3 py-2 rounded-xl border ${sort === 'last' ? 'bg-green-500 text-zinc-950 border-green-400' : 'bg-white/10 text-white border-white/20'}`}
              >
                Son yanıt
              </button>
              <button
                onClick={() => setSort('replies')}
                className={`forum-chip px-3 py-2 rounded-xl border ${sort === 'replies' ? 'bg-green-500 text-zinc-950 border-green-400' : 'bg-white/10 text-white border-white/20'}`}
              >
                Yanıt sayısı
              </button>
              <button
                onClick={() => setSort('views')}
                className={`forum-chip px-3 py-2 rounded-xl border ${sort === 'views' ? 'bg-green-500 text-zinc-950 border-green-400' : 'bg-white/10 text-white border-white/20'}`}
              >
                Görüntülenme
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-3">
            <div className="flex items-center gap-2 bg-zinc-900/60 rounded-xl border border-white/10 px-4 py-3">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Başlık ve içerikte ara"
                className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900/70 text-white px-3 py-3"
            >
              <option value="all">Tüm kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((thread) => (
            <button
              key={thread.id}
              onClick={() => navigate(`/forum/konu/${thread.slug || thread.id}-${thread.id}`)}
              className="forum-card w-full text-left rounded-xl border border-white/10 bg-white/5 p-5 hover:border-green-400/60 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="forum-muted text-xs flex items-center gap-2">
                    <Hash className="w-4 h-4" /> {thread.category?.name} / {thread.forum?.name}
                  </p>
                  <h3 className="text-lg font-semibold text-white">{thread.title}</h3>
                  <p className="forum-muted text-sm line-clamp-2">{thread.body}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {thread.tags.map((tag) => (
                      <span key={tag} className="forum-chip px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-xs text-zinc-400 space-y-1">
                  <div className="px-2 py-1 rounded-full bg-white/5 border border-white/10 inline-flex items-center gap-1">
                    {thread.reply_count ?? 0} yanıt
                  </div>
                  <div>{thread.view_count} görüntülenme</div>
                  <div>{new Date(thread.last_activity_at).toLocaleString('tr-TR')}</div>
                  <ArrowRight className="w-4 h-4 text-green-400 ml-auto" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
