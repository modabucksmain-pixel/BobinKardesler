import { useEffect, useState } from 'react';
import { ArrowLeft, MessagesSquare, PenSquare } from 'lucide-react';
import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';
import { ForumThreadList } from '../../components/forum/ForumThreadList';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import { getForumBySlugs, getForumCategoryBySlug, getThreadsForForum, type ForumCategory, type ForumForum, type ForumThread } from '../../lib/forum';
import { navigate } from '../../lib/navigation';

interface Props {
  categorySlug: string;
  forumSlug: string;
}

export function ForumForumPage({ categorySlug, forumSlug }: Props) {
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [forum, setForum] = useState<ForumForum | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Forum Başlıkları | Bobin Kardeşler';
    loadForum();
  }, [categorySlug, forumSlug]);

  async function loadForum() {
    const [{ data: categoryData }, { data: forumData, error: forumError }] = await Promise.all([
      getForumCategoryBySlug(categorySlug),
      getForumBySlugs(categorySlug, forumSlug),
    ]);
    const { data: threadData } = await getThreadsForForum(forumSlug);

    setCategory(categoryData);
    setForum(forumData);
    setThreads(threadData);
    setError(forumError?.message ?? null);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="pt-24 sm:pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <button
              onClick={() => navigate('/forum')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Foruma dön
            </button>
            <ForumThemeToggle />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700">
                  <MessagesSquare className="w-4 h-4" />
                  Alt forum
                </p>
                <h1 className="text-2xl font-bold text-slate-900">{forum?.name ?? 'Forum'}</h1>
                {forum?.description && <p className="text-sm text-slate-600 max-w-3xl">{forum.description}</p>}
              </div>
              <button
                onClick={() => navigate('/forum/yeni-konu')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-400"
              >
                <PenSquare className="w-4 h-4" /> Yeni konu
              </button>
            </div>

            <ForumBreadcrumbs
              items={[
                { label: 'Forum', href: '/forum' },
                { label: category?.name ?? 'Kategori', href: `/forum/kategori/${categorySlug}` },
                { label: forum?.name ?? 'Forum' },
              ]}
              onNavigate={navigate}
            />
          </div>

          {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">{error}</div>}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ForumThreadList
              threads={threads}
              onSelect={(thread) => navigate(`/forum/konu/${thread.slug || thread.id}-${thread.id}`)}
              emptyLabel="Henüz konu açılmadı. İlk sen yaz."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
