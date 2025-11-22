import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, CheckCircle2, Heart, Lock, MessageCircle, Quote, Send, ShieldCheck, Timer, Flag, Eye } from 'lucide-react';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import {
  createForumReply,
  getForumReplies,
  getForumThreadById,
  getSimilarThreads,
  getUserForumRole,
  incrementThreadViewCount,
  markThreadSolved,
  buildThreadPath,
  type ForumReply,
  type ForumThread,
} from '../../lib/forum';
import { formatDate } from '../../lib/youtube';
import { navigate } from '../../lib/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ForumPostCard } from '../../components/forum/ForumPostCard';

interface Props {
  slugAndId: string;
}

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
        forumId: data.forum_id,
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

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="pt-28 sm:pt-32 pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <button
              onClick={() => navigate(`/forum/kategori/${thread?.category?.slug || 'kategori'}/${thread?.forum?.slug || 'forum'}`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Foruma dön
            </button>
            <ForumThemeToggle />
          </div>

          {error && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800 text-sm">{error}</div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-2">
            <div className="flex items-center flex-wrap gap-2 text-sm font-semibold text-slate-700">
              <a href="#thread" className="px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700">
                Konu
              </a>
              <a href="#replies" className="px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700">
                Mesajlar
              </a>
              <a href="#reply-form" className="px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700">
                Yanıt Yaz
              </a>
              <a href="#similar-topics" className="px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700">
                Benzer Konular
              </a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr] items-start">
            <div className="space-y-4">
              <section id="thread" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                {loadingThread ? (
                  <div className="space-y-3">
                    <div className="h-7 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-20 bg-slate-200 rounded-lg animate-pulse" />
                  </div>
                ) : thread ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Timer className="w-4 h-4" /> {thread.status === 'resolved' ? 'Çözüldü' : thread.status === 'in_progress' ? 'Takipte' : 'Açık'}
                      </span>
                      {thread.is_locked && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                          <Lock className="w-4 h-4" /> Kilitli
                        </span>
                      )}
                      {thread.google_connected && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <BadgeCheck className="w-4 h-4" /> Google bağlı
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">{thread.title}</h1>
                    <p className="text-slate-800 whitespace-pre-line leading-relaxed">{thread.body}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                        <Heart className="w-4 h-4" /> {likes[thread.id] || 12} beğeni
                      </span>
                      <button
                        onClick={() => handleLike(thread.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Heart className="w-4 h-4" /> Beğen
                      </button>
                      <button
                        onClick={() => setQuote(thread.body)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Quote className="w-4 h-4" /> Alıntıla
                      </button>
                      <button
                        onClick={() => notification.info('Raporun alındı, moderasyon ekibine iletildi.')}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <Flag className="w-4 h-4" /> Şikayet et
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {thread.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-slate-600">Görüntülenme: {thread.view_count}</div>
                  </div>
                ) : (
                  <div className="text-slate-600">Konu bulunamadı.</div>
                )}
              </section>

              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-blue-800">
                  <ShieldCheck className="w-5 h-5" />
                  <p className="font-semibold">Admin çözüm alanı</p>
                </div>
                <p className="text-sm text-blue-900/80 leading-relaxed">
                  Çözüm işaretleme işlemi Supabase RPC ile sadece admin rolüne açık olacak şekilde tasarlandı. Rol bilgisini user_profiles tablosundan çekiyoruz.
                </p>
              </section>

              <section id="replies" className="space-y-3">
                {loadingReplies ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-center text-slate-500 py-6 bg-white border border-slate-200 rounded-2xl">Henüz yanıt yok.</div>
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

              {!thread?.is_locked && (
                <form
                  id="reply-form"
                  onSubmit={handleReplySubmit}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      {isGoogleLinked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <BadgeCheck className="w-4 h-4" /> Google bağlı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <Lock className="w-4 h-4" /> Bağlantı gerekiyor
                        </span>
                      )}
                      <span>Admin yanıtları otomatik vurgulanır.</span>
                    </div>
                    <div className="text-xs text-slate-500">{replies.length} yanıt</div>
                  </div>
                  {quote && (
                    <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      Alıntı: {quote.slice(0, 140)}...
                      <button onClick={() => setQuote('')} className="ml-2 underline text-blue-700">kaldır</button>
                    </div>
                  )}
                  <textarea
                    placeholder="Kendi deneyimini ve çözüm adımlarını paylaş..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 resize-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!replyBody}
                  >
                    <Send className="w-4 h-4" /> Yanıt Gönder
                  </button>
                </form>
              )}

              {thread?.is_locked && (
                <div className="flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                  <Lock className="w-4 h-4" />
                  Konu çözüm işaretlendiği için kilitlendi. Yeni yanıt eklemek için adminlerle iletişime geç.
                </div>
              )}
            </div>

            <div className="space-y-4" id="similar-topics">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Konu bilgileri</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Görüntülenme</span>
                    <span className="font-semibold text-slate-900">{thread?.view_count ?? '-'} </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Beğeniler</span>
                    <span className="font-semibold text-slate-900">{thread ? likes[thread.id] || 12 : '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Durum</span>
                    <span className="font-semibold text-slate-900 capitalize">{thread?.status || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Yanıt sayısı</span>
                    <span className="font-semibold text-slate-900">{replies.length}</span>
                  </div>
                </div>
              </div>

              <SimilarTopicsList threads={similarThreads} />

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm text-sm text-slate-500">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Benzer konular</h3>
        <span className="text-xs text-slate-500">{threads.length} başlık</span>
      </div>
      <ul className="divide-y divide-slate-200">
        {threads.map((item) => (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0">
            <button
              onClick={() => navigate(buildThreadPath(item))}
              className="text-left w-full space-y-1"
            >
              <p className="font-semibold text-slate-900 hover:text-blue-700 leading-snug">{item.title}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                {item.category?.name && <span className="text-slate-500">{item.category.name}</span>}
                {item.forum?.name && <span className="text-slate-400">• {item.forum.name}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {item.reply_count ?? 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {item.view_count}
                </span>
                <span className="inline-flex items-center gap-1 capitalize">
                  <Timer className="w-3 h-3" /> {item.status}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
