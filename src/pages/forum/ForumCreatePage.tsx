import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Info, Send, ShieldCheck, Sparkles, Tag, Tags } from 'lucide-react';
import { ForumThemeToggle } from '../../components/forum/ForumThemeToggle';
import { navigate } from '../../lib/navigation';

const TAG_OPTIONS = [
  'site-duyurulari',
  'google-dogrulama',
  'teknik-destek',
  'yazilim',
  'donanim',
  'oneriler',
];

export function ForumCreatePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['site-duyurulari']);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    document.title = 'Forum | Yeni Başlık Oluştur';
    document.body.dataset.forumTheme = (localStorage.getItem('bk-forum-theme') as 'dark' | 'light' | null) ?? 'dark';
  }, []);

  const formattedTags = useMemo(() => selectedTags.join(', '), [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Taslağın oluşturuldu. Google doğrulaması sonrası yayınlanacak.');
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-14 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-3 text-sm text-zinc-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/forum')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:border-emerald-300/60 hover:text-emerald-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Foruma dön
            </button>
            <div className="h-8 w-px bg-white/10" aria-hidden />
            <span className="text-white font-semibold">Forum</span>
            <span className="text-zinc-600">/</span>
            <button
              onClick={() => navigate('/forum/kategori/duyurular/site-duyurulari')}
              className="text-emerald-200 hover:text-emerald-100"
            >
              Site Duyuruları
            </button>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200">Yeni Başlık</span>
          </div>
          <ForumThemeToggle />
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr,0.9fr]">
          <div className="space-y-4">
            <div className="forum-card rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="forum-chip inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  Google doğrulamalı yayın
                </div>
                <div className="forum-chip inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <Tags className="w-4 h-4 text-blue-300" />
                  SEO uyumlu başlık
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Başlık</label>
                  <input
                    type="text"
                    placeholder="Örn: Google doğrulama hatası nasıl çözülür?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">İçerik</label>
                  <textarea
                    placeholder="Detayları, denediğin adımları ve ekran görüntülerini paylaş."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-400 resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-semibold text-white">Etiketler</label>
                    <span className="text-xs text-emerald-200">{formattedTags || 'etiket seç'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => {
                      const isActive = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`forum-chip inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-300/60 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]'
                              : 'bg-white/5 text-zinc-200 border-white/15 hover:border-emerald-300/60 hover:text-emerald-100'
                          }`}
                        >
                          <Tag className="w-4 h-4" /> #{tag.replace(/-/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {statusMessage && (
                  <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-emerald-100 text-sm">
                    {statusMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!title || !content}
                >
                  <Send className="w-5 h-5" />
                  Başlığı Paylaş
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="forum-card rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 shadow-xl">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Google doğrulaması gerekiyor</p>
                  <p className="text-sm text-emerald-50/80">
                    Hesabını Google ile bağla, sahte içerikleri filtreleyelim ve içerik kalitesini koruyalım.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-100">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/50 font-semibold">Doğrulama aktif</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-semibold">Spam engeli</span>
              </div>
            </div>

            <div className="forum-card rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Site Duyuruları</p>
                  <h2 className="text-lg font-bold text-white">Yeni konu açmadan önce</h2>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
              <ul className="space-y-2 text-sm text-zinc-200 list-disc list-inside">
                <li>Güncel kuralları ve sabit konuları kontrol et.</li>
                <li>Benzer başlıkları aratarak tekrarları azalt.</li>
                <li>Başlığı anlaşılır, açıklayıcı ve etiketli yaz.</li>
              </ul>
              <button
                onClick={() => navigate('/forum/kategori/duyurular/site-duyurulari')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
              >
                Site Duyurularını Aç
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div className="forum-card rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl space-y-2">
              <p className="text-sm font-semibold text-white">Başlık hazırlama ipuçları</p>
              <p className="text-sm text-zinc-200">
                Teknik detay, kullandığın cihaz ve adımlarını yaz. Varsa hata kodunu ve ekran görüntüsünü ekle ki daha hızlı destek alabil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
