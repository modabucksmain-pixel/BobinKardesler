import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';

export function ForumCreatePage() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 text-white">
      <div className="mx-auto max-w-4xl px-4 space-y-6">
        <ForumBreadcrumbs
          items={[
            { label: 'Forum', href: '/forum' },
            { label: 'Yeni Forum' },
          ]}
        />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h1 className="text-2xl font-bold">Forum oluşturma sayfası</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Bu sayfa henüz uygulamaya entegre edilmedi. Forum oluşturma işlevi burada yer alacak.
          </p>
        </div>
      </div>
    </div>
  );
}
