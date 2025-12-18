import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  BookmarkCheck,
  CheckCircle2,
  Filter,
  Flag,
  Lock,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  Unlock,
  Zap,
} from 'lucide-react';
import {
  createForumReply,
  createForumThread,
  getForumReplies,
  getForumThreads,
  getMockForumData,
  markThreadSolved,
  type ForumReply,
  type ForumThread,
  type ForumStatus,
} from '../lib/forum';
import { formatDate } from '../lib/youtube';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface ComposerState {
  title: string;
  body: string;
  tags: string;
}

export function ForumPage() {
  const { user, loading: authLoading, isGoogleLinked, signInWithGoogle, linkGoogleAccount } = useAuth();
  const notification = useNotification();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [composer, setComposer] = useState<ComposerState>({ title: '', body: '', tags: '' });
  const [replyBody, setReplyBody] = useState('');
  const [statusFilter, setStatusFilter] = useState<ForumStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('');

  const isAdmin = Boolean(user?.user_metadata?.role === 'admin' || user?.email?.endsWith('@bobinkardesler.com'));

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadReplies(selectedThread.id);
    }
  }, [selectedThread?.id]);

  const filteredThreads = useMemo(() => {
    return threads
      .filter((thread) =>
        statusFilter === 'all' ? true : thread.status === statusFilter
      )
      .filter((thread) =>
        activeTag ? thread.tags.includes(activeTag) : true
      )
      .filter((thread) =>
        searchTerm
          ? `${thread.title} ${thread.body} ${thread.tags.join(' ')}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : true
      );
  }, [threads, statusFilter, searchTerm, activeTag]);

  const stats = useMemo(() => {
    const resolved = threads.filter((t) => t.status === 'resolved').length;
    const open = threads.filter((t) => t.status === 'open').length;
    const inProgress = threads.filter((t) => t.status === 'in_progress').length;
    return { resolved, open, inProgress };
  }, [threads]);

  async function loadThreads() {
    setLoadingThreads(true);
    const data = await getForumThreads();
    setThreads(data);
    setSelectedThread((prev) => prev ? data.find((item) => item.id === prev.id) || data[0] || null : data[0] || null);
    setLoadingThreads(false);
  }

  async function loadReplies(threadId: string) {
    setLoadingReplies(true);
    const data = await getForumReplies(threadId);
    setReplies(data);
    setLoadingReplies(false);
  }

  const ensureGoogleConnection = async () => {
    if (authLoading) {
      notification.info('Kimlik doğrulaması tamamlanıyor, lütfen bekleyin.');
      return false;
    }

    if (isGoogleLinked) return true;

    if (!user && !authLoading) {
      notification.info('Forumda yazmak için Google hesabını bağlaman gerekiyor. Yönlendiriyoruz.');
      const { error } = await signInWithGoogle();
      if (error) notification.error('Google ile giriş başlatılamadı.');
      return false;
    }

    if (user && !isGoogleLinked) {
      const { error } = await linkGoogleAccount();
      if (error) {
        notification.error('Google hesabı bağlanamadı: ' + error.message);
        return false;
      }
      notification.info('Google hesabını bağlamak için yönlendiriliyorsun.');
      return false;
    }

    return true;
  };

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    const canPost = await ensureGoogleConnection();
    if (!canPost) return;

    if (!user) {
      notification.error('Başlık açmak için önce giriş yapmalısın.');
      return;
    }

    const tagList = composer.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { success, error } = await createForumThread({
      title: composer.title,
      body: composer.body,
      tags: tagList,
      status: 'open',
      created_by: user.id,
      created_by_email: user.email || null,
      google_connected: isGoogleLinked,
      solution_reply_id: null,
      view_count: 0,
      is_locked: false,
    });

    if (!success || error) {
      notification.error('Başlık oluşturulamadı.');
      return;
    }

    notification.success('Yeni başlık yayınlandı!');
    setComposer({ title: '', body: '', tags: '' });
    await loadThreads();
  }

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedThread) return;

    const canPost = await ensureGoogleConnection();
    if (!canPost) return;

    if (!user) {
      notification.error('Yanıt eklemek için giriş yapmalısın.');
      return;
    }

    const { success, error } = await createForumReply({
      thread_id: selectedThread.id,
      body: replyBody,
      author_id: user.id,
      author_email: user.email || null,
      is_admin_response: isAdmin,
      is_solution: false,
    });

    if (!success || error) {
      notification.error('Yanıt gönderilirken bir sorun oluştu.');
      return;
    }

    notification.success('Yanıtın paylaşıldı.');
    setReplyBody('');
    await loadReplies(selectedThread.id);
    await loadThreads();
  }

  async function handleMarkSolution(reply: ForumReply) {
    if (!selectedThread) return;
    if (!isAdmin) {
      notification.error('Sadece adminler çözüm işaretleyebilir.');
      return;
    }

    const { success, error } = await markThreadSolved(selectedThread.id, reply.id);
    if (!success || error) {
      notification.error('Çözüm işaretlenemedi.');
      return;
    }

    notification.success('Çözüm öne çıkarıldı.');
    await Promise.all([loadReplies(selectedThread.id), loadThreads()]);
  }

  const tags = Array.from(new Set(threads.flatMap((thread) => thread.tags))).slice(0, 12);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-zinc-900/60 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative grid lg:grid-cols-[1.6fr_1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Technopat tarzı hızlı teknik destek</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                Forum: Sorunları Anlat, Admin Çözümüyle Kapanış Yap
              </h1>
              <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                Google hesabını bağla, sorununu detaylıca aktar ve Bobin Kardeşler adminlerinden yanıt al. Etiketler ve durum rozetleriyle hangi konuların çözüldüğünü anında gör.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <BadgeCheck className="w-5 h-5 text-green-400" />
                  <span>Google ile doğrulanmış hesap şartı</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Admin çözüm işaretleme</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <Timer className="w-5 h-5 text-amber-400" />
                  <span>Anlık durum takibi</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-green-500/10 blur-3xl" />
              <div className="relative rounded-2xl border border-green-500/30 bg-zinc-950/70 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-11 w-11 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Bağlantı Durumu</p>
                      <p className="text-white font-semibold">Google hesabı gereklidir</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isGoogleLinked ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                    {isGoogleLinked ? 'Google bağlı' : 'Bağlantı bekleniyor'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-zinc-300">
                  <StatusPill label="Çözülen" value={stats.resolved} tone="green" />
                  <StatusPill label="Açık" value={stats.open} tone="amber" />
                  <StatusPill label="İzleniyor" value={stats.inProgress} tone="blue" />
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <p className="text-white font-semibold">Kurallar</p>
                  </div>
                  <ul className="text-sm text-zinc-300 space-y-2 list-disc list-inside">
                    <li>Hesabını Google ile doğrulamadan mesaj yazılamaz.</li>
                    <li>Admin yanıtları otomatik olarak öne çıkarılır.</li>
                    <li>Çözüm işaretlendiğinde konu kilitlenebilir.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-green-400" />
                    Konu Filtreleri
                  </h2>
                  <p className="text-sm text-zinc-400">Durum, etiket ve arama ile Technopat benzeri filtreleme.</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">{threads.length} konu</div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">{stats.resolved} çözüm</div>
                </div>
              </div>

              <div className="grid md:grid-cols-[1fr_240px] gap-4">
                <input
                  type="text"
                  placeholder="Başlık, etiket veya cihaz ara"
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

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag((prev) => (prev === tag ? '' : tag))}
                      className={`px-3 py-2 rounded-full border transition ${
                        activeTag === tag
                          ? 'bg-green-500 text-zinc-950 border-green-400'
                          : 'bg-white/5 text-zinc-200 border-white/10 hover:border-green-400/40'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  Başlıklar
                </h2>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Admin çözümü
                  </div>
                  <div className="flex items-center gap-1">
                    <Flag className="w-4 h-4 text-amber-400" />
                    Açık başlık
                  </div>
                </div>
              </div>

              {loadingThreads ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-20 bg-zinc-800/70 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">Filtrelere uygun konu bulunamadı.</div>
              ) : (
                <div className="space-y-3">
                  {filteredThreads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        selectedThread?.id === thread.id
                          ? 'bg-green-500/10 border-green-400/60'
                          : 'bg-white/5 border-white/5 hover:border-green-400/50 hover:bg-white/10'
                      }`}
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
                          <span>{formatDate(thread.last_activity_at)}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">{thread.view_count} görüntülenme</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-green-400" />
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
                  value={composer.title}
                  onChange={(e) => setComposer((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
                />
                <textarea
                  placeholder="Sorunu detaylıca anlat, denediğin adımları yaz."
                  value={composer.body}
                  onChange={(e) => setComposer((prev) => ({ ...prev, body: e.target.value }))}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500 resize-none"
                />
                <input
                  type="text"
                  placeholder="Etiketler (virgülle ayır: esp32, wifi, güç)"
                  value={composer.tags}
                  onChange={(e) => setComposer((prev) => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-zinc-950 font-bold hover:bg-green-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!composer.title || !composer.body}
                >
                  <Send className="w-5 h-5" />
                  Başlık Oluştur
                </button>
              </form>
              {!isGoogleLinked && (
                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100 text-sm">
                  <p className="font-semibold mb-1">Google hesabını bağlamadan mesajın yayınlanmaz.</p>
                  <p>Forumda paylaşım yapmak için Google ile giriş yap veya mevcut hesabına Google bağla.</p>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 sm:p-6">
              {selectedThread ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={selectedThread.status} />
                        {selectedThread.is_locked && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                            <Lock className="w-4 h-4" /> Kilitli
                          </span>
                        )}
                        {selectedThread.google_connected && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-200">
                            <BadgeCheck className="w-4 h-4" /> Google bağlı
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{selectedThread.title}</h3>
                      <p className="text-zinc-300 whitespace-pre-line">{selectedThread.body}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {selectedThread.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-zinc-200 border border-white/10">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-1 text-sm text-zinc-400 min-w-[120px]">
                      <p>Son hareket: {formatDate(selectedThread.last_activity_at)}</p>
                      <p>Görüntülenme: {selectedThread.view_count}</p>
                    </div>
                  </div>

                  <div className="border border-white/5 rounded-xl p-4 bg-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-5 h-5 text-green-400" />
                      <p className="text-white font-semibold">Admin Çözüm Alanı</p>
                    </div>
                    <p className="text-sm text-zinc-300">
                      Admin hesabı ile yanıt verildiğinde rozet ve çözüm işaretleme otomatik aktif olur. Technopat tarzı en iyi çözüm öne çıkarma burada uygulanıyor.
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
                            </div>
                            <p className="text-xs text-zinc-400">{formatDate(reply.created_at)}</p>
                          </div>
                          <p className="text-sm text-zinc-200 whitespace-pre-line">{reply.body}</p>
                          {isAdmin && !reply.is_solution && (
                            <button
                              onClick={() => handleMarkSolution(reply)}
                              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-green-500 text-zinc-950 hover:bg-green-400 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Çözüm olarak işaretle
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {!selectedThread.is_locked && (
                    <form onSubmit={handleReplySubmit} className="space-y-3">
                      <textarea
                        placeholder="Kendi deneyimini ve çözüm adımlarını paylaş..."
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500 resize-none"
                      />
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
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={!replyBody}
                        >
                          <Send className="w-4 h-4" /> Yanıt Gönder
                        </button>
                      </div>
                    </form>
                  )}

                  {selectedThread.is_locked && (
                    <div className="flex items-center gap-2 text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm">
                      <Lock className="w-4 h-4" />
                      Konu çözüm işaretlendiği için kilitlendi. Yeni yanıt eklemek için adminlerle iletişime geç.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-400">Bir başlık seçmek için listeden tıkla.</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 bg-zinc-900/60 border border-white/10 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Teknik Paketi Kopyala</h3>
              <p className="text-sm text-zinc-400">
                Google bağlantısı, çözüm işaretleme, Technopat benzeri etiketli konu yapısı ve admin rozetleri bu pakette hazır. Supabase tablosu forum_threads + forum_replies olarak tasarlandı.
              </p>
            </div>
            <button
              onClick={() => {
                const { threads: mockForumThreads, replies: mockForumReplies } = getMockForumData();
                navigator.clipboard.writeText(JSON.stringify({ threads: mockForumThreads, replies: mockForumReplies }, null, 2));
                notification.success('Örnek forum verileri kopyalandı.');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-zinc-950 font-semibold hover:bg-green-400 transition"
            >
              <Unlock className="w-5 h-5" /> Mock veriyi kopyala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: number; tone: 'green' | 'amber' | 'blue' }) {
  const colors = {
    green: 'bg-green-500/15 text-green-200 border-green-500/40',
    amber: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    blue: 'bg-blue-500/15 text-blue-200 border-blue-500/30',
  };

  return (
    <div className={`rounded-xl p-3 border text-center ${colors[tone]}`}>
      <p className="text-xl font-black">{value}</p>
      <p className="text-xs uppercase tracking-wide">{label}</p>
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
