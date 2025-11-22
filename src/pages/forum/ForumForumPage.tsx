import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';
import { navigate } from '../../lib/navigation';

interface Props {
  categorySlug: string;
  forumSlug: string;
}

export function ForumForumPage({ categorySlug, forumSlug }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 text-white">
      <div className="mx-auto max-w-5xl px-4 space-y-6">
        <ForumBreadcrumbs
          items={[
            { label: 'Forum', href: '/forum' },
            { label: categorySlug, href: `/forum/kategori/${categorySlug}` },
            { label: forumSlug },
          ]}
          onNavigate={navigate}
        />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h1 className="text-2xl font-bold">{forumSlug} forumu</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Bu forumdaki konu listesi burada görüntülenecek.
          </p>
        </div>
      </div>
    </div>
  );
}
