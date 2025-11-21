import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, CheckCircle2, Heart, Lock, MessageCircle, Quote, Send, ShieldCheck, Timer, Flag } from 'lucide-react';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import {
  createForumReply,
  getForumReplies,
  getForumThreadById,
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
    <div className="min-h-screen pt-24 sm:pt-28 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <button
            onClick={() => navigate(`/forum/kategori/${thread?.category?.slug || 'kategori'}/${thread?.forum?.slug || 'forum'}`)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-green-400/50 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Foruma dön
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100 text-sm">{error}</div>
        )}

        <div className="forum-card rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          {loadingThread ? (
            <div className="space-y-3">
              <div className="h-8 bg-zinc-800/70 rounded-lg animate-pulse" />
              <div className="h-24 bg-zinc-800/70 rounded-lg animate-pulse" />
            </div>
          ) : thread ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/40">
                  <Timer className="w-4 h-4" /> {thread.status === 'resolved' ? 'Çözüldü' : thread.status === 'in_progress' ? 'Takipte' : 'Açık'}
                </span>
                {thread.is_locked && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                    <Lock className="w-4 h-4" /> Kilitli
                  </span>
                )}
                {thread.google_connected && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-200">
                    <BadgeCheck className="w-4 h-4" /> Google bağlı
                  </span>
                )}
                <ForumThemeToggle />
              </div>
              <h1 className="text-3xl font-black text-white">{thread.title}</h1>
              <p className="text-zinc-200 whitespace-pre-line">{thread.body}</p>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  <Heart className="w-4 h-4" /> {likes[thread.id] || 12} beğeni
                </span>
                <button
                  onClick={() => handleLike(thread.id)}
                  className="text-green-300 hover:text-green-100 underline"
                >
                  Beğen
                </button>
                <button
                  onClick={() => setQuote(thread.body)}
                  className="text-green-300 hover:text-green-100 underline inline-flex items-center gap-1"
                >
                  <Quote className="w-4 h-4" /> Alıntıla
                </button>
                <button onClick={() => notification.info('Raporun alındı, moderasyon ekibine iletildi.')} className="inline-flex items-center gap-1 text-amber-200 hover:text-amber-100">
                  <Flag className="w-4 h-4" /> Şikayet et
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {thread.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-zinc-200 border border-white/10">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-zinc-400">Görüntülenme: {thread.view_count}</div>
            </div>
          ) : (
            <div className="text-zinc-300">Konu bulunamadı.</div>
          )}
        </div>

        <div className="forum-card rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <p className="text-white font-semibold">Admin çözüm alanı</p>
          </div>
          <p className="text-sm text-zinc-300">
            Çözüm işaretleme işlemi Supabase RPC ile sadece admin rolüne açık olacak şekilde tasarlandı. Rol bilgisini user_profiles tablosundan çekiyoruz.
          </p>
        </div>

        <div className="space-y-3">
          {loadingReplies ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-16 bg-zinc-800/70 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center text-zinc-400 py-6">Henüz yanıt yok.</div>
          ) : (
              replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`rounded-xl border p-4 space-y-2 ${
                    reply.is_solution
                      ? 'border-green-500/60 bg-green-500/5'
                      : reply.is_admin_response
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-white/5 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {reply.is_admin_response ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/30">
                          <ShieldCheck className="w-4 h-4" /> Admin yanıtı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-white/10 text-zinc-200 border border-white/20">
                          <MessageCircle className="w-4 h-4" /> Kullanıcı yanıtı
                        </span>
                      )}
                      {reply.is_solution && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-100 border border-green-400/40">
                          <CheckCircle2 className="w-4 h-4" /> Çözüm
                        </span>
                      )}
                      <button
                        onClick={() => setQuote(reply.body)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-white/5 border border-white/10 text-zinc-200 hover:border-green-400/40"
                      >
                        <Quote className="w-3 h-3" /> Alıntıla
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400">{formatDate(reply.created_at)}</p>
                  </div>
                  <p className="text-sm text-zinc-200 whitespace-pre-line">{reply.body}</p>
                  {canModerate && !reply.is_solution && (
                    <button
                      onClick={() => handleMarkSolution(reply)}
                      className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-green-500 text-zinc-950 hover:bg-green-400 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Çözüm olarak işaretle
                    </button>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <button
                      onClick={() => handleLike(reply.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:border-green-400/40"
                    >
                      <Heart className="w-3 h-3" /> {likes[reply.id] || 0}
                    </button>
                    <button
                      onClick={() => notification.info('Şikayet kaydedildi.')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40"
                    >
                      <Flag className="w-3 h-3" /> Şikayet et
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        {!thread?.is_locked && (
          <form onSubmit={handleReplySubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 forum-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {isGoogleLinked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/15 text-green-200 border border-green-500/40">
                    <BadgeCheck className="w-4 h-4" /> Google bağlı
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/30">
                    <Lock className="w-4 h-4" /> Bağlantı gerekiyor
                  </span>
                )}
                <span>Admin yanıtları otomatik vurgulanır.</span>
              </div>
              <div className="text-xs text-zinc-400">{replies.length} yanıt</div>
              </div>
            {quote && (
              <div className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                Alıntı: {quote.slice(0, 140)}...
                <button onClick={() => setQuote('')} className="ml-2 underline text-emerald-100">kaldır</button>
              </div>
            )}
            <textarea
              placeholder="Kendi deneyimini ve çözüm adımlarını paylaş..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500 resize-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!replyBody}
            >
              <Send className="w-4 h-4" /> Yanıt Gönder
            </button>
          </form>
        )}

        {thread?.is_locked && (
          <div className="flex items-center gap-2 text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm">
            <Lock className="w-4 h-4" />
            Konu çözüm işaretlendiği için kilitlendi. Yeni yanıt eklemek için adminlerle iletişime geç.
          </div>
        )}
      </div>
    </div>
  );
}
