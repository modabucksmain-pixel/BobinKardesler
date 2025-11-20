import { useState, useEffect } from 'react';
import { Zap, Menu, X, Search } from 'lucide-react';
import { Link } from './Link';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-zinc-950/98 backdrop-blur-lg border-b border-green-500/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-all duration-300">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-green-500 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-green-500 glow-text">
                Bobin Kardeşler
              </h1>
              <p className="text-xs text-zinc-400 hidden sm:block">Underground Elektrik</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="nav-link">
              Ana Sayfa
            </Link>
            <Link href="/videos" className="nav-link">
              Videolar
            </Link>
            <Link href="/projeler" className="nav-link">
              Projeler
            </Link>
            <Link href="/blog" className="nav-link">
              Blog
            </Link>
            <Link href="/duyurular" className="nav-link">
              Duyurular
            </Link>
            <Link href="/topluluk" className="nav-link">
              Topluluk
            </Link>
            <Link href="/anketler" className="nav-link">
              Anketler
            </Link>
            <Link href="/cekilisler" className="nav-link">
              Çekilişler
            </Link>
            <Link
              href="/ara"
              className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-green-500 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-900/95 backdrop-blur-lg border-t border-green-500/10">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/videos"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Videolar
            </Link>
            <Link
              href="/projeler"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Projeler
            </Link>
            <Link
              href="/blog"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/duyurular"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Duyurular
            </Link>
            <Link
              href="/topluluk"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Topluluk
            </Link>
            <Link
              href="/anketler"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Anketler
            </Link>
            <Link
              href="/cekilisler"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Çekilişler
            </Link>
            <Link
              href="/video-fikirleri"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Video Fikri Öner
            </Link>
            <Link
              href="/hakkimizda"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hakkımızda
            </Link>
            <Link
              href="/ara"
              className="block py-2 text-zinc-300 hover:text-green-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ara
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .nav-link {
          position: relative;
          color: rgb(212 212 216);
          transition: color 0.3s;
        }
        .nav-link:hover {
          color: rgb(34 197 94);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: rgb(34 197 94);
          transition: width 0.3s;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
}
