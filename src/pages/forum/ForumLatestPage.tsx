import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Inbox } from 'lucide-react';
import { ForumThreadList } from '../../components/forum/ForumThreadList';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import { getLatestThreads, getUnansweredThreads, type ForumThread } from '../../lib/forum';
import { navigate } from '../../lib/navigation';

export function ForumLatestPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUnansweredView = useMemo(() => window.location.pathname.includes('cevapsiz'), []);

  useEffect(() => {
    document.title = isUnansweredView ? 'Cevapsız Konular | Forum' : 'Son Konular | Forum';
    loadThreads();
  }, [isUnansweredView]);

  async function loadThreads() {
    setLoading(true);
    const { data, error: fetchError } = isUnansweredView ? await getUnansweredThreads(12) : await getLatestThreads(12);
    if (fetchError) setError(fetchError.message);
    setThreads(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="pt-24 sm:pt-28 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-slate-800">
              {isUnansweredView ? <Inbox className="w-5 h-5 text-emerald-600" /> : <Clock3 className="w-5 h-5 text-blue-600" />}
              <div>
                <h1 className="text-2xl font-bold">
                  {isUnansweredView ? 'Yanıt bekleyen konular' : 'Son açılan konular'}
                </h1>
                <p className="text-sm text-slate-600">
                  {isUnansweredView
                    ? 'Hiç yanıt almayan konuları listeledik. İlk yorum senin olsun.'
                    : 'Tüm forumlardan en güncel konular sıralandı.'}
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{error}</p>}

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <ForumThreadList
                threads={threads}
                onSelect={(thread) => navigate(`/forum/konu/${thread.slug || thread.id}-${thread.id}`)}
                emptyLabel={isUnansweredView ? 'Tebrikler! Tüm konular yanıtlanmış.' : 'Henüz konu yok.'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
