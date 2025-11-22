import { useEffect, useState } from 'react';
import { Zap, Search, Sparkles } from 'lucide-react';
import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contentLinks = [
    { href: '/videos', label: 'Videolar' },
    { href: '/blog', label: 'Blog' },
    { href: '/projeler', label: 'Projeler' },
    { href: '/duyurular', label: 'Duyurular' },
  ];

  const communityLinks = [
    { href: '/forum', label: 'Forum' },
    { href: '/forum/son-konular', label: 'Son Konular' },
    { href: '/topluluk', label: 'Topluluk' },
    { href: '/anketler', label: 'Anketler' },
    { href: '/cekilisler', label: 'Çekilişler' },
    { href: '/account', label: 'Profilim' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 ${
        isScrolled ? 'shadow-lg shadow-green-500/10' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between h-24">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-green-500/20 blur-md transition group-hover:scale-110" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 text-green-400 shadow-inner">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
              <div className="leading-tight">
                <p className="text-base text-zinc-400 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-400" />
                  Elektrik & Maker Üssü
                </p>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">Bobin Kardeşler</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/ara"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3.5 sm:p-4 text-white transition hover:border-green-400/40"
                aria-label="Ara"
              >
                <Search className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="pb-6">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-200/80">
                <Sparkles className="h-4 w-4" />
                Keşfet
              </div>
              <div className="text-xs text-zinc-400">Kaydırarak tüm bölümlere ulaş</div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-zinc-900/80 snap-x snap-mandatory">
              <div className="snap-start min-w-[260px] rounded-2xl border border-zinc-800/60 bg-zinc-900/95 p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
                  <span>İçerik</span>
                  <Sparkles className="h-4 w-4 text-green-300" />
                </div>
                <div className="mt-3 space-y-2">
                  {contentLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 md:text-base"
                    >
                      {link.label}
                      <Sparkles className="h-4 w-4 text-green-300" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="snap-start min-w-[260px] rounded-2xl border border-zinc-800/60 bg-zinc-900/95 p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
                  <span>Topluluk</span>
                  <Sparkles className="h-4 w-4 text-green-300" />
                </div>
                <div className="mt-3 space-y-2">
                  {communityLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 md:text-base"
                    >
                      {link.label}
                      <Sparkles className="h-4 w-4 text-green-300" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="snap-start min-w-[260px] rounded-2xl border border-green-500/30 bg-green-500/10 p-4 shadow-xl shadow-green-500/20">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-green-100">
                  <Sparkles className="h-4 w-4" />
                  Hesap ve Kısayollar
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {!loading && (
                    <>
                      {user ? (
                        <>
                          <Link
                            href="/account"
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-green-400/60 hover:bg-white/20"
                          >
                            Hesap Ayarları
                            <Sparkles className="h-4 w-4 text-green-200" />
                          </Link>
                          <button
                            onClick={async () => {
                              await signOut();
                              window.location.href = '/';
                            }}
                            className="flex items-center justify-between rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:border-red-400/80 hover:bg-red-500/20"
                          >
                            Çıkış
                            <Sparkles className="h-4 w-4 text-red-100" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-green-400/60 hover:bg-white/10"
                          >
                            Giriş Yap
                            <Sparkles className="h-4 w-4 text-green-200" />
                          </Link>
                          <Link
                            href="/register"
                            className="flex items-center justify-between rounded-xl border border-green-500/60 bg-green-500/20 px-4 py-3 text-sm font-semibold text-green-100 transition hover:bg-green-500/30"
                          >
                            Hesap Oluştur
                            <Sparkles className="h-4 w-4 text-green-200" />
                          </Link>
                        </>
                      )}
                    </>
                  )}
                  <Link
                    href="/ara"
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-green-400/50 hover:bg-white/10"
                  >
                    Arama
                    <span className="text-xs text-zinc-200">⌘K</span>
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-green-100/80">
                  <span className="rounded-full bg-white/10 px-3 py-1">Hızlı erişim</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Mobil uyumlu</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Kaydırılabilir</span>
                </div>
              </div>

              <div className="snap-start min-w-[260px] rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-green-200" />
                  Güncel Başlıklar
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {['Duyurular', 'Forum', 'Projeler', 'Çekilişler'].map((item) => (
                    <Link
                      key={item}
                      href={`/${item.toLowerCase()}`}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-3 text-sm font-semibold text-white transition hover:border-green-400/50 hover:bg-white/10"
                    >
                      <span>{item}</span>
                      <Sparkles className="h-4 w-4 text-green-200" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
