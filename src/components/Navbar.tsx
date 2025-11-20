import { useState } from 'react';
import { Zap, Menu, X, Search, Sparkles } from 'lucide-react';
import { Link } from './Link';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/videos', label: 'Videolar' },
    { href: '/projeler', label: 'Projeler' },
    { href: '/blog', label: 'Blog' },
    { href: '/duyurular', label: 'Duyurular' },
    { href: '/topluluk', label: 'Topluluk' },
    { href: '/anketler', label: 'Anketler' },
    { href: '/cekilisler', label: 'Çekilişler' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-green-500/10 transition-all duration-500"
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

          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
            <Link
              href="/ara"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:border-green-400/50 hover:text-green-200"
            >
              <Search className="h-4 w-4" />
              Ara
            </Link>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:border-green-400/40"
            aria-label="Menü"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/ara"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/5"
            >
              Ara
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .nav-link {
          position: relative;
          padding: 0.6rem 0.4rem;
          color: rgb(226 232 240);
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -6px;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, rgba(74, 222, 128, 0.8), rgba(16, 185, 129, 0.8));
          transition: width 0.3s ease;
        }
        .nav-link:hover {
          color: rgb(110 231 183);
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </header>
  );
}
