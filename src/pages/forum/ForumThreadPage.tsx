import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Eye,
  Flag,
  Heart,
  Lock,
  MessageCircle,
  Quote,
  Send,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import {
  buildThreadPath,
  createForumReply,
  getForumReplies,
  getForumThreadById,
  getSimilarThreads,
  getUserForumRole,
  incrementThreadViewCount,
  markThreadSolved,
  type ForumReply,
  type ForumThread,
} from '../../lib/forum';
import { formatDate } from '../../lib/youtube';
import { navigate } from '../../lib/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ForumPostCard } from '../../components/forum/ForumPostCard';
import { ForumBreadcrumbs } from '../../components/forum/ForumBreadcrumbs';

interface Props {
  slugAndId: string;
}

const statusStyles: Record<ForumThread['status'] | 'unknown', string> = {
  open: 'bg-emerald-500/15 text-emerald-100 border border-emerald-400/40',
  in_progress: 'bg-amber-500/15 text-amber-100 border border-amber-400/40',
  resolved: 'bg-blue-500/15 text-blue-100 border border-blue-400/40',
  unknown: 'bg-white/10 text-white border border-white/20',
};

export function ForumThreadPage({ slugAndId }: Props) {
  const threadId = slugAndId.split('-').pop() || '';
  const { user, loading: authLoading, isGoogleLinked, signInWithGoogle, linkGoogleAccount } = useAuth();
  const notification = useNotification();

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loadingThread, setLoadingThread] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [role, setRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [similarThreads, setSimilarThreads] = useState<ForumThread[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('bk-forum-likes');
    return stored ? JSON.parse(stored) : {};
  });
  const [quote, setQuote] = useState('');

  const canModerate = role === 'admin' || role === 'moderator';

  useEffect(() => {
    document.body.dataset.forumTheme = (localStorage.getItem('bk-forum-theme') as 'dark' | 'light' | null) ?? 'dark';
    loadThread();
  }, [threadId]);

  useEffect(() => {
    if (user?.id) {
      getUserForumRole(user.id).then((userRole) => {
        if (userRole) setRole(userRole);
      });
    }
  }, [user?.id]);

  async function loadThread() {
    setLoadingThread(true);
    const { data, error: fetchError } = await getForumThreadById(threadId);
    if (fetchError || !data) {
      setError('Konu bulunamadı veya yüklenemedi.');
      setLoadingThread(false);
      return;
    }

    setThread(data);
    setSimilarThreads(
      getSimilarThreads({
        forumId: data.forum?.id,
        categoryId: data.category?.id,
        excludeId: data.id,
      })
    );
    setError(null);
    document.title = `${data.title} | Forum`;
    incrementThreadViewCount(threadId);
    setLoadingThread(false);
    await loadReplies();
  }

  async function loadReplies() {
    setLoadingReplies(true);
    const { data, error: repliesError } = await getForumReplies(threadId);
    if (repliesError || !data) {
      setError('Yanıtlar yüklenemedi.');
    } else {
      setReplies(data);
    }
    setLoadingReplies(false);
  }

  const ensureGoogleConnection = async () => {
    if (authLoading) {
      notification.info('Kimlik doğrulaması tamamlanıyor, lütfen bekleyin.');
      return false;
    }

    if (isGoogleLinked) return true;

    if (!user && !authLoading) {
      notification.info('Yanıt yazmak için Google hesabı gerekiyor.');
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

  const handleLike = (id: string) => {
    const updated = { ...likes, [id]: (likes[id] || 0) + 1 };
    setLikes(updated);
    localStorage.setItem('bk-forum-likes', JSON.stringify(updated));
  };

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thread) return;
    const canPost = await ensureGoogleConnection();
    if (!canPost) return;
    if (!user) {
      notification.error('Yanıt eklemek için giriş yapmalısın.');
      return;
    }

    const bodyWithQuote = quote ? `> ${quote}\n\n${replyBody}` : replyBody;

    const { error: createError } = await createForumReply({
      thread_id: thread.id,
      body: bodyWithQuote,
      author_id: user.id,
      author_email: user.email || null,
    });

    if (createError) {
      notification.error('Yanıt gönderilirken bir sorun oluştu.');
      return;
    }

    notification.success('Yanıtın paylaşıldı.');
    setReplyBody('');
    setQuote('');
    await loadReplies();
  }

  async function handleMarkSolution(reply: ForumReply) {
    if (!thread) return;
    const isOwner = thread.created_by && thread.created_by === user?.id;
    if (!canModerate && !isOwner) {
      notification.error('Çözüm işaretleme yetkin yok.');
      return;
    }

    const { error: solveError } = await markThreadSolved(thread.id, reply.id);
    if (solveError) {
      notification.error('Çözüm işaretlenemedi.');
      return;
    }

    notification.success('Çözüm öne çıkarıldı.');
    await Promise.all([loadReplies(), loadThread()]);
  }

  const breadcrumbItems = [
    { label: 'Forum', href: '/forum' },
    thread?.category?.slug
      ? { label: thread.category.name, href: `/forum/kategori/${thread.category.slug}` }
      : { label: 'Kategori' },
    thread?.forum?.slug && thread?.category?.slug
      ? { label: thread.forum.name, href: `/forum/kategori/${thread.category.slug}/${thread.forum.slug}` }
      : { label: 'Forum' },
    thread?.title ? { label: thread.title } : { label: 'Konu' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="pt-24 sm:pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm">
            <ForumBreadcrumbs items={breadcrumbItems} onNavigate={navigate} />
            <div className="flex items-center gap-2 text-sm text-zinc-200">
              <button
                onClick={() => navigate(`/forum/kategori/${thread?.category?.slug || 'kategori'}/${thread?.forum?.slug || 'forum'}`)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-semibold text-white hover:border-emerald-300/60 hover:text-emerald-100"
              >
                <ArrowLeft className="w-4 h-4" /> Foruma dön
              </button>
              <ForumThemeToggle />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-amber-200/60 bg-amber-500/10 p-4 text-amber-100 text-sm">{error}</div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr] items-start">
            <div className="space-y-4">
              <section id="thread" className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4">
                {loadingThread ? (
                  <div className="space-y-3">
                    <div className="h-6 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-24 bg-white/10 rounded-lg animate-pulse" />
                  </div>
                ) : thread ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${statusStyles[thread.status || 'unknown']}`}>
                        <Timer className="w-4 h-4" />
                        {thread.status === 'resolved'
                          ? 'Çözüldü'
                          : thread.status === 'in_progress'
                          ? 'Takipte'
                          : thread.status === 'open'
                          ? 'Açık'
                          : 'Durum Bilinmiyor'}
                      </span>
                      {thread.is_locked && (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-white/10 border border-white/20 text-zinc-200">
                          <Lock className="w-4 h-4" /> Kilitli
                        </span>
                      )}
                      {thread.google_connected && (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-100">
                          <BadgeCheck className="w-4 h-4" /> Google bağlı
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h1 className="text-3xl font-black text-white leading-tight">{thread.title}</h1>
                      <p className="text-sm text-zinc-300">
                        {thread.category?.name && <span>{thread.category.name}</span>}
                        {thread.forum?.name && <span className="text-zinc-500"> • {thread.forum.name}</span>}
                        <span className="text-zinc-500"> • {formatDate(thread.created_at)}</span>
                      </p>
                    </div>

                    <p className="text-zinc-100 whitespace-pre-line leading-relaxed">{thread.body}</p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-200">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        <MessageCircle className="w-4 h-4" /> {replies.length} yanıt
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        <Eye className="w-4 h-4" /> {thread.view_count ?? 0} görüntülenme
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        <Heart className="w-4 h-4" /> {likes[thread.id] || 0} beğeni
                      </span>
                      <button
                        onClick={() => handleLike(thread.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white hover:border-emerald-300/60 hover:text-emerald-100"
                      >
                        <Heart className="w-4 h-4" /> Beğen
                      </button>
                      <button
                        onClick={() => setQuote(thread.body)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white hover:border-emerald-300/60 hover:text-emerald-100"
                      >
                        <Quote className="w-4 h-4" /> Alıntıla
                      </button>
                      <button
                        onClick={() => notification.info('Raporun alındı, moderasyon ekibine iletildi.')}
                        className="inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-1 font-semibold text-amber-50 hover:border-amber-300/60"
                      >
                        <Flag className="w-4 h-4" /> Şikayet et
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-300">Konu bulunamadı.</div>
                )}
              </section>

              <section className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-5 space-y-3 text-emerald-50 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                  <p className="font-semibold">Admin çözüm alanı</p>
                </div>
                <p className="text-sm text-emerald-100/90 leading-relaxed">
                  Çözüm işaretleme işlemi Supabase RPC ile sadece admin rolüne açık olacak şekilde tasarlandı. Rol bilgisini user_profiles tablosundan çekiyoruz.
                </p>
              </section>

              <section id="replies" className="space-y-3">
                {loadingReplies ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="h-16 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-center text-zinc-300 py-6 rounded-2xl border border-white/10 bg-white/5">Henüz yanıt yok.</div>
                ) : (
                  replies.map((reply) => (
                    <div key={reply.id} className="space-y-2">
                      <ForumPostCard
                        reply={reply}
                        likes={likes[reply.id] || 0}
                        onLike={() => handleLike(reply.id)}
                        onQuote={(resp) => setQuote(resp.body)}
                      />
                      {canModerate && !reply.is_solution && (
                        <button
                          onClick={() => handleMarkSolution(reply)}
                          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Çözüm olarak işaretle
                        </button>
                      )}
                    </div>
                  ))
                )}
              </section>

              {quote && (
                <div className="text-xs text-emerald-50 bg-emerald-500/15 border border-emerald-400/40 rounded-lg px-3 py-2 flex items-start justify-between gap-3">
                  <span className="flex-1">Alıntı: {quote.slice(0, 200)}...</span>
                  <button onClick={() => setQuote('')} className="text-emerald-200 underline">kaldır</button>
                </div>
              )}

              {!thread?.is_locked && (
                <form id="reply-form" onSubmit={handleReplySubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white">Yanıt yaz</p>
                      <p className="text-sm text-zinc-300">Kendi deneyimini ve çözüm adımlarını paylaş.</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                      <MessageCircle className="w-4 h-4" /> {replies.length} yanıt
                    </span>
                  </div>

                  <textarea
                    placeholder="Kendi deneyimini ve çözüm adımlarını paylaş..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400 resize-none"
                  />

                  <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">Görsel ekle</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">Kod bloğu</span>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-900 font-semibold hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!replyBody}
                  >
                    <Send className="w-4 h-4" /> Yanıt Gönder
                  </button>
                </form>
              )}

              {thread?.is_locked && (
                <div className="flex items-center gap-2 text-amber-100 bg-amber-500/20 border border-amber-400/40 rounded-xl px-4 py-3 text-sm">
                  <Lock className="w-4 h-4" />
                  Konu çözüm işaretlendiği için kilitlendi. Yeni yanıt eklemek için adminlerle iletişime geç.
                </div>
              )}
            </div>

            <div className="space-y-4" id="similar-topics">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-white">Konu bilgileri</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-zinc-200">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Görüntülenme</span>
                    <span className="font-semibold text-white">{thread?.view_count ?? '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Beğeniler</span>
                    <span className="font-semibold text-white">{thread ? likes[thread.id] || 0 : '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Durum</span>
                    <span className="font-semibold text-white capitalize">{thread?.status || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Yanıt sayısı</span>
                    <span className="font-semibold text-white">{replies.length}</span>
                  </div>
                </div>
              </div>

              <SimilarTopicsList threads={similarThreads} />

              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-5 shadow-sm text-sm text-zinc-300">
                Sağ sütun için reklam veya widget alanı. Duyuru, kampanya veya topluluk kuralları için kullanılabilir.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimilarTopicsList({ threads }: { threads: ForumThread[] }) {
  if (!threads.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-white">
        <h3 className="text-sm font-semibold">Benzer konular</h3>
        <span className="text-xs text-zinc-300">{threads.length} başlık</span>
      </div>
      <ul className="divide-y divide-white/10">
        {threads.map((item) => (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0">
            <button
              onClick={() => navigate(buildThreadPath(item))}
              className="text-left w-full space-y-1"
            >
              <p className="font-semibold text-white hover:text-emerald-200 leading-snug">{item.title}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                {item.category?.name && <span className="text-zinc-400">{item.category.name}</span>}
                {item.forum?.name && <span className="text-zinc-500">• {item.forum.name}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {item.reply_count ?? 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {item.view_count ?? 0}
                </span>
                <span className="inline-flex items-center gap-1 capitalize">
                  <Timer className="w-3 h-3" /> {item.status || 'durum yok'}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
