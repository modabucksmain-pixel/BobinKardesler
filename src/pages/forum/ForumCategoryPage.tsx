import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';
import { navigate } from '../../lib/navigation';

interface Props {
  categorySlug: string;
}

export function ForumCategoryPage({ categorySlug }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 text-white">
      <div className="mx-auto max-w-5xl px-4 space-y-6">
        <ForumBreadcrumbs
          items={[
            { label: 'Forum', href: '/forum' },
            { label: 'Kategori', href: '/forum/kategori' },
            { label: categorySlug },
          ]}
          onNavigate={navigate}
        />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h1 className="text-2xl font-bold">{categorySlug} kategorisi</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Seçilen kategorideki alt forum ve konular burada listelenecek.
          </p>
        </div>
      </div>
    </div>
  );
}
