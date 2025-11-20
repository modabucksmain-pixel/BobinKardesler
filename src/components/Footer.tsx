import { useState } from 'react';
import { Zap, Youtube, Mail, Send, Sparkles, Terminal, ShieldCheck, Activity } from 'lucide-react';
import { subscribeToNewsletter } from '../lib/newsletter';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateLog = [
    {
      time: '22:14',
      status: 'DEPLOY',
      message: 'Yeni "Uzun Format" filtreleri aktifleştirildi. Shorts devre dışı.',
    },
    {
      time: '21:02',
      status: 'SYNC',
      message: 'Topluluk duyuruları Supabase ile eşitlendi.',
    },
    {
      time: '20:45',
      status: 'BUILD',
      message: 'Atölye logları için neon terminal teması eklendi.',
    },
  ];

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await subscribeToNewsletter(email);

    if (result.success) {
      setMessage('Başarıyla abone oldunuz!');
      setEmail('');
    } else {
      setMessage(result.error || 'Bir hata oluştu.');
    }

    setLoading(false);
  }

  return (
    <footer className="mt-16 border-t border-white/10 bg-zinc-950">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="absolute -top-20 right-10 h-40 w-40 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-green-400 shadow-inner">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-green-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Underground Elektrik
                </p>
                <h3 className="text-2xl font-black text-white">Bobin Kardeşler</h3>
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Atölyeden yayılan enerjiyi dijital vitrine taşıyan proje güncellemeleri, şemalar ve topluluk buluşmaları.
            </p>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="badge-soft">Enerji</span>
              <span className="badge-soft">Maker</span>
              <span className="badge-soft">Topluluk</span>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="text-white font-semibold">Keşfet</h4>
              <div className="space-y-2 text-sm text-zinc-300">
                <a href="/videos" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Videolar</a>
                <a href="/projeler" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Projeler</a>
                <a href="/blog" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Blog</a>
                <a href="/topluluk" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Topluluk</a>
                <a href="/hakkimizda" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Hakkımızda</a>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-semibold">Topluluk</h4>
              <div className="space-y-2 text-sm text-zinc-300">
                <a href="/duyurular" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Duyurular</a>
                <a href="/anketler" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Anketler</a>
                <a href="/cekilisler" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Çekilişler</a>
                <a href="/video-fikirleri" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">Video Önerileri</a>
                <a href="/istatistikler" className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition">İstatistikler</a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold">Bülten</h4>
              <p className="text-sm text-zinc-300">Yeni içerikleri ve çekilişleri ilk öğrenen ekipte olun.</p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-green-400/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-green-500/30 transition hover:shadow-green-500/40 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Gönderiliyor...' : 'Bültene Katıl'}
                </button>
              </form>
              {message && (
                <p className={`text-sm ${message.includes('Başarıyla') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>
              )}
              <div className="space-y-2 text-sm text-zinc-300">
                <a
                  href="https://youtube.com/@bobinkardesler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition"
                >
                  <Youtube className="h-4 w-4" />
                  YouTube Kanalı
                </a>
                <a
                  href="mailto:info@bobinkardesler.com"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5 hover:text-green-200 transition"
                >
                  <Mail className="h-4 w-4" />
                  info@bobinkardesler.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 relative overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-zinc-950 via-zinc-950/70 to-black shadow-2xl">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_45%)]" />
          <div className="absolute inset-0 border border-white/5 rounded-2xl" />
          <div className="relative p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-300 shadow-inner">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-green-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Günlük Akışı
                  </p>
                  <h4 className="text-lg font-bold text-white">Underground Log</h4>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/40 uppercase tracking-[0.2em]">
                Canlı
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-green-100">
              {updateLog.map((entry) => (
                <div
                  key={entry.time + entry.status}
                  className="relative overflow-hidden rounded-xl border border-green-500/20 bg-black/60 px-4 py-3 shadow-lg shadow-green-500/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/10" />
                  <div className="relative flex items-center justify-between text-[11px] text-green-400">
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      {entry.time}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-[10px] font-black tracking-[0.2em]">
                      {entry.status}
                    </span>
                  </div>
                  <p className="relative mt-2 text-sm leading-relaxed text-zinc-100">
                    <span className="text-green-400">$</span> {entry.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative mt-2 flex items-center justify-between text-xs text-green-300/80 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Veri hattı şifreli | Son bağlantı: {new Date().toLocaleTimeString('tr-TR')}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
                <span>Stüdyo çevrimiçi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} Bobin Kardeşler. Tüm hakları saklıdır.</p>
          <p className="text-xs sm:text-sm text-zinc-500">
            Bu site Bobin Kardeşler'den <span className="text-green-400 font-semibold">Bahadır</span> tarafından yapılmıştır.{' '}
            <a href="mailto:Theworld1716@gmail.com" className="text-green-300 hover:text-green-200 font-semibold">
              Theworld1716@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
