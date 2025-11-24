import { useEffect, useState } from 'react';
import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';
import { ForumThreadList } from '../../components/forum/ForumThreadList';
import { getLatestThreads, type ForumThread } from '../../lib/forum';
import { navigate } from '../../lib/navigation';

export function ForumLatestPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestThreads().then((data) => {
      setThreads(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 sm:pt-32 pb-12 text-white">
      <div className="mx-auto max-w-5xl px-4 space-y-6">
        <ForumBreadcrumbs
          items={[
            { label: 'Forum', href: '/forum' },
            { label: 'Son Konular' },
          ]}
          onNavigate={navigate}
        />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h1 className="text-2xl font-bold">Son Konular</h1>
          <p className="mt-2 text-sm text-zinc-300">Tüm forumlardaki en güncel başlıklar.</p>
          <div className="mt-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-24 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <ForumThreadList
                threads={threads}
                onSelect={(thread) => navigate(`/forum/konu/${thread.slug || thread.id}-${thread.id}`)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
