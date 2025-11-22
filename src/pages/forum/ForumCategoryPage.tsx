import { useEffect, useState } from 'react';
import { ArrowLeft, FolderOpen, Sparkles } from 'lucide-react';
import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';
import { ForumCategoryList } from '../../components/forum/ForumCategoryList';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import { getForumCategoryBySlug, getForumsForCategory, type ForumCategory, type ForumForum } from '../../lib/forum';
import { navigate } from '../../lib/navigation';

interface Props {
  categorySlug: string;
}

export function ForumCategoryPage({ categorySlug }: Props) {
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [forums, setForums] = useState<ForumForum[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Forum Kategorisi | Bobin Kardeşler';
    loadCategory();
  }, [categorySlug]);

  async function loadCategory() {
    const { data: categoryData, error: categoryError } = await getForumCategoryBySlug(categorySlug);
    const { data: forumData } = await getForumsForCategory(categorySlug);
    setCategory(categoryData);
    setForums(forumData);
    setError(categoryError?.message ?? null);
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
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <FolderOpen className="w-4 h-4" />
                  Kategori
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{category?.name ?? 'Kategori'}</h1>
                {category?.description && <p className="text-sm text-slate-600 max-w-3xl">{category.description}</p>}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                SEO uyumlu URL yapısı otomatik olarak oluşturuldu.
              </div>
            </div>

            <ForumBreadcrumbs
              items={[
                { label: 'Forum', href: '/forum' },
                { label: category?.name ?? 'Kategori' },
              ]}
              onNavigate={navigate}
            />
          </div>

          {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">{error}</div>}

          <ForumCategoryList
            categories={category && forums.length ? [{ ...category, forums }] : []}
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}
