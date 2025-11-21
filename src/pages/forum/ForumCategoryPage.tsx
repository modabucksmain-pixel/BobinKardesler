import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, FolderOpen } from 'lucide-react';
import { getCategoryWithForums, type ForumCategory, type ForumForum } from '../../lib/forum';
import { navigate } from '../../lib/navigation';

interface Props {
  categorySlug: string;
}

export function ForumCategoryPage({ categorySlug }: Props) {
  const [category, setCategory] = useState<(ForumCategory & { forums: ForumForum[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Forum | ${categorySlug}`;
    loadCategory();
  }, [categorySlug]);

  async function loadCategory() {
    setLoading(true);
    const { data, error: fetchError } = await getCategoryWithForums(categorySlug);
    if (fetchError || !data) {
      setError('Kategori bilgisi alınamadı.');
    } else {
      setCategory(data);
      setError(null);
      document.title = `Forum | ${data.name}`;
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <button
            onClick={() => navigate('/forum')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-green-400/50 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Forum ana sayfa
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                <FolderOpen className="w-4 h-4" />
                Kategori
              </div>
              <h1 className="text-3xl font-bold text-white">{category?.name || 'Kategori Yükleniyor'}</h1>
              {category?.description && <p className="text-zinc-300">{category.description}</p>}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100 text-sm">{error}</div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {loading
            ? [...Array(4)].map((_, idx) => <div key={idx} className="h-32 bg-zinc-800/60 rounded-xl animate-pulse" />)
            : category?.forums.map((forum) => (
                <button
                  key={forum.id}
                  onClick={() => navigate(`/forum/kategori/${category.slug}/${forum.slug}`)}
                  className="text-left rounded-xl border border-white/10 bg-zinc-900/60 hover:border-green-400/60 hover:bg-zinc-900/90 transition p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-white">{forum.name}</h3>
                      {forum.description && <p className="text-sm text-zinc-400">{forum.description}</p>}
                    </div>
                    <ArrowRight className="w-4 h-4 text-green-400" />
                  </div>
                  {typeof forum.thread_count === 'number' && (
                    <p className="text-xs text-zinc-400 mt-2">{forum.thread_count} başlık</p>
                  )}
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
