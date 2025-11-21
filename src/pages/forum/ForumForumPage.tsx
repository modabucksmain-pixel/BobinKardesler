import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CheckCircle2, Filter, Flag, Send, Tag, Timer } from 'lucide-react';
import {
  buildThreadPath,
  createForumThread,
  getForumBySlugs,
  getForumThreads,
  type ForumForum,
  type ForumStatus,
  type ForumThread,
} from '../../lib/forum';
import { navigate } from '../../lib/navigation';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  categorySlug: string;
  forumSlug: string;
}

export function ForumForumPage({ categorySlug, forumSlug }: Props) {
  const { user, loading: authLoading, isGoogleLinked, signInWithGoogle, linkGoogleAccount } = useAuth();
  const notification = useNotification();
  const [forum, setForum] = useState<ForumForum | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ForumStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  useEffect(() => {
    loadForum();
  }, [categorySlug, forumSlug]);

  async function loadForum() {
    setLoading(true);
    const { data, error: forumError } = await getForumBySlugs(categorySlug, forumSlug);
    if (forumError || !data) {
      setError('Forum bilgisi alınamadı.');
      setLoading(false);
      return;
    }

    setForum(data);
    setError(null);
    document.title = `${data.name} | Forum`;
    await loadThreads(data.id);
    setLoading(false);
  }

  async function loadThreads(forumId: string) {
    const { data, error: threadsError } = await getForumThreads(forumId);
    if (threadsError || !data) {
      setError('Başlıklar yüklenirken bir sorun oluştu.');
    } else {
      setThreads(data);
    }
  }

  const filteredThreads = useMemo(() => {
    return threads
      .filter((thread) => (statusFilter === 'all' ? true : thread.status === statusFilter))
      .filter((thread) =>
        searchTerm
          ? `${thread.title} ${thread.body} ${thread.tags.join(' ')}`.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      );
  }, [threads, statusFilter, searchTerm]);

  const availableTags = useMemo(() => Array.from(new Set(threads.flatMap((thread) => thread.tags))).slice(0, 12), [threads]);

  const ensureGoogleConnection = async () => {
    if (authLoading) {
      notification.info('Kimlik doğrulaması tamamlanıyor, lütfen bekleyin.');
      return false;
    }

    if (isGoogleLinked) return true;

    if (!user && !authLoading) {
      notification.info('Başlık açmak için Google hesabı gerekiyor.');
      const { error: signInError } = await signInWithGoogle();
      if (signInError) notification.error('Google ile giriş başlatılamadı.');
      return false;
    }

    if (user && !isGoogleLinked) {
      const { error: linkError } = await linkGoogleAccount();
      if (linkError) {
        notification.error('Google hesabı bağlanamadı: ' + linkError.message);
        return false;
      }
      notification.info('Google hesabını bağlamak için yönlendiriliyorsun.');
      return false;
    }

    return true;
  };

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!forum) return;
    const canPost = await ensureGoogleConnection();
    if (!canPost) return;
    if (!user) {
      notification.error('Başlık açmak için giriş yapmalısın.');
      return;
    }

    const tagList = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { error: createError } = await createForumThread({
      forum_id: forum.id,
      title: titleInput,
      slug: null,
      body: bodyInput,
      tags: tagList,
      status: 'open',
      created_by: user.id,
      created_by_email: user.email || null,
      google_connected: isGoogleLinked,
      solution_reply_id: null,
      view_count: 0,
      is_locked: false,
    });

    if (createError) {
      notification.error('Başlık oluşturulamadı.');
      return;
    }

    setTitleInput('');
    setBodyInput('');
    setTagsInput('');
    notification.success('Yeni başlık yayınlandı!');
    await loadThreads(forum.id);
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <button
            onClick={() => navigate('/forum')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-green-400/50 text-white"
          >
            Ana sayfa
          </button>
          <span className="text-zinc-500">/</span>
          <button
            onClick={() => navigate(`/forum/kategori/${categorySlug}`)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-green-400/50 text-white"
          >
            {categorySlug}
          </button>
          <span className="text-zinc-500">/</span>
          <span className="text-white font-semibold">{forum?.name || forumSlug}</span>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-zinc-900/60 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white">{forum?.name || 'Forum'}</h1>
              <p className="text-zinc-300">{forum?.description || 'Alt forum detayları yükleniyor.'}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${isGoogleLinked ? 'bg-green-500/15 text-green-200 border-green-500/40' : 'bg-amber-500/10 text-amber-200 border-amber-500/30'}`}>
              {isGoogleLinked ? 'Google bağlı' : 'Google bağla'}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100 text-sm">{error}</div>
        )}

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-green-400" />
                    Konu filtreleri
                  </h2>
                  <p className="text-sm text-zinc-400">Duruma göre filtrele veya başlıklarda ara.</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">{threads.length} konu</span>
                </div>
              </div>

              <div className="grid md:grid-cols-[1fr_220px] gap-3">
                <input
                  type="text"
                  placeholder="Başlık veya etiket ara"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
                />
                <div className="flex items-center gap-2">
                  {['all', 'open', 'in_progress', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as ForumStatus | 'all')}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        statusFilter === status
                          ? 'bg-green-500 text-zinc-950 border-green-400'
                          : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-green-500/50'
                      }`}
                    >
                      {status === 'all'
                        ? 'Hepsi'
                        : status === 'open'
                          ? 'Açık'
                          : status === 'in_progress'
                            ? 'Takipte'
                            : 'Çözüldü'}
                    </button>
                  ))}
                </div>
              </div>

              {availableTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {availableTags.map((tag) => (
                    <span key={tag} className="px-3 py-2 rounded-full bg-white/5 text-zinc-200 border border-white/10 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-20 bg-zinc-800/70 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">Bu forumda henüz konu yok.</div>
              ) : (
                filteredThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => navigate(buildThreadPath(thread))}
                    className="w-full text-left rounded-xl border p-4 transition-all bg-white/5 border-white/5 hover:border-green-400/50 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={thread.status} />
                          {thread.solution_reply_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-500/15 border border-green-400/40 text-green-200">
                              <CheckCircle2 className="w-4 h-4" /> Çözüm var
                            </span>
                          )}
                          {thread.google_connected && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-blue-500/10 border border-blue-400/40 text-blue-200">
                              <BadgeCheck className="w-4 h-4" /> Google bağlı
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white">{thread.title}</h3>
                        <p className="text-sm text-zinc-400 line-clamp-2">{thread.body}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {thread.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-zinc-200 border border-white/10">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 text-sm text-zinc-400 min-w-[110px]">
                        <span>{thread.reply_count ?? 0} yanıt</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">{thread.view_count} görüntülenme</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-400" />
                  Yeni Başlık Aç
                </h2>
                <p className="text-sm text-zinc-400">Google doğrulaması olmadan paylaşım yapılamaz.</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${isGoogleLinked ? 'bg-green-500/15 text-green-200 border-green-500/40' : 'bg-amber-500/10 text-amber-200 border-amber-500/30'}`}>
                {isGoogleLinked ? 'Hazır' : 'Google bağla'}
              </div>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-3">
              <input
                type="text"
                placeholder="Başlık (ör. ESP32 Wi-Fi kopma sorunu)"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
              />
              <textarea
                placeholder="Sorunu detaylıca anlat, denediğin adımları yaz."
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500 resize-none"
              />
              <input
                type="text"
                placeholder="Etiketler (virgülle ayır: esp32, wifi, güç)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-zinc-950 font-bold hover:bg-green-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!titleInput || !bodyInput}
              >
                <Send className="w-5 h-5" />
                Başlık Oluştur
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ForumStatus }) {
  const map = {
    open: {
      label: 'Açık',
      classes: 'bg-amber-500/15 text-amber-200 border border-amber-500/40',
    },
    in_progress: {
      label: 'Takipte',
      classes: 'bg-blue-500/15 text-blue-200 border border-blue-500/40',
    },
    resolved: {
      label: 'Çözüldü',
      classes: 'bg-green-500/15 text-green-200 border border-green-500/40',
    },
  } as const;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${map[status].classes}`}>
      {status === 'open' ? <Flag className="w-4 h-4" /> : status === 'in_progress' ? <Timer className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} {map[status].label}
    </span>
  );
}
