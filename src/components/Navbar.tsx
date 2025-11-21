import { useEffect, useRef, useState } from 'react';
import { Zap, Menu, X, Search, Sparkles } from 'lucide-react';
import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);

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
    { href: '/topluluk', label: 'Topluluk' },
    { href: '/anketler', label: 'Anketler' },
    { href: '/cekilisler', label: 'Çekilişler' },
  ];

  useEffect(() => {
    if (!isDrawerOpen) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
        focusableSelectors.join(', ')
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
      focusableSelectors.join(', ')
    );
    focusableElements?.[0]?.focus();

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 ${
        isScrolled ? 'shadow-lg shadow-green-500/10' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-green-500/20 blur-md transition group-hover:scale-110" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-green-400 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <div className="leading-tight">
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-400" />
                Elektrik & Maker Üssü
              </p>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight">Bobin Kardeşler</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/ara"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:border-green-400/40"
              aria-label="Ara"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:border-green-400/40"
              aria-label="Menüyü Aç"
              aria-expanded={isDrawerOpen}
              aria-controls="main-navigation-drawer"
            >
              {isDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition ${
          isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsDrawerOpen(false)}
        />
        <div
          id="main-navigation-drawer"
          ref={drawerRef}
          className={`absolute left-0 top-0 h-full w-80 max-w-full transform bg-zinc-950/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <Link
              href="/"
              className="flex items-center space-x-2 rounded-lg px-2 py-1 transition hover:bg-white/5"
              onClick={() => setIsDrawerOpen(false)}
            >
              <Zap className="w-6 h-6 text-green-400" />
              <span className="text-base font-semibold text-white">Bobin Kardeşler</span>
            </Link>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-lg p-2 text-zinc-200 hover:bg-white/5"
              aria-label="Menüyü Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-5 space-y-6 overflow-y-auto h-[calc(100%-5rem)]">
            <div className="space-y-3">
              <Link
                href="/ara"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-green-400/50 hover:text-green-100"
                onClick={() => setIsDrawerOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5" />
                  <span>Arama</span>
                </div>
                <span className="text-xs text-zinc-400">⌘K</span>
              </Link>
              {!loading && (
                <div className="grid grid-cols-2 gap-3">
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:border-green-400/60 hover:text-green-100"
                      >
                        Hesap Ayarları
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut();
                          setIsDrawerOpen(false);
                          window.location.href = '/';
                        }}
                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/0 px-3 py-3 text-sm font-semibold text-white transition hover:border-red-400/60 hover:text-red-100"
                      >
                        Çıkış
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:border-green-400/60 hover:text-green-100"
                      >
                        Giriş Yap
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-center rounded-xl border border-green-500/60 bg-green-500/20 px-3 py-3 text-sm font-semibold text-green-100 transition hover:bg-green-500/30"
                      >
                        Hesap Oluştur
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-zinc-400">İçerik</div>
              <div className="space-y-1">
                {contentLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-zinc-400">Topluluk</div>
              <div className="space-y-1">
                {communityLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
