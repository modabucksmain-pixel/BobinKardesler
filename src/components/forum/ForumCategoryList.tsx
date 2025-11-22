import { FolderOpen, MessagesSquare } from 'lucide-react';
import type { ForumCategory, ForumForum } from '../../lib/forum';

interface Props {
  categories: (ForumCategory & { forums: ForumForum[] })[];
  onNavigate: (href: string) => void;
}

export function ForumCategoryList({ categories, onNavigate }: Props) {
  return (
    <div className="grid gap-4">
      {categories.map((category) => (
        <article
          key={category.id}
          className="forum-card rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="forum-chip inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                <FolderOpen className="h-4 w-4" />
                Kategori
              </div>
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              {category.description && <p className="forum-muted">{category.description}</p>}
            </div>
            <button
              onClick={() => onNavigate(`/forum/kategori/${category.slug}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-emerald-300/60 hover:text-emerald-100"
            >
              Kategoriyi Aç
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {category.forums.map((forum) => (
              <button
                key={forum.id}
                onClick={() => onNavigate(`/forum/kategori/${category.slug}/${forum.slug}`)}
                className="forum-card w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-300/60 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{forum.name}</h3>
                    {forum.description && <p className="text-sm forum-muted">{forum.description}</p>}
                  </div>
                  {typeof forum.thread_count === 'number' && (
                    <span className="forum-chip rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      <MessagesSquare className="w-4 h-4" /> {forum.thread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

