import { useState } from 'react';
import { Zap, Youtube, Mail, Send } from 'lucide-react';
import { subscribeToNewsletter } from '../lib/newsletter';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-green-500 mb-3">Bültenimize Abone Olun</h3>
          <p className="text-zinc-400 mb-6">Yeni videolar, projeler ve içeriklerden haberdar olun!</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              required
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-zinc-950 font-bold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Gönderiliyor...' : 'Abone Ol'}</span>
            </button>
          </form>
          {message && (
            <p className={`mt-3 text-sm ${message.includes('Başarıyla') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-500 glow-text">Bobin Kardeşler</h3>
                <p className="text-xs text-zinc-400">Underground Elektrik</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Underground elektrik projeleri, eğitim içerikleri ve teknoloji ile ilgili her şey.
            </p>
          </div>

          <div>
            <h4 className="text-green-500 font-semibold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-zinc-400 hover:text-green-500 transition-colors text-sm">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="/videos" className="text-zinc-400 hover:text-green-500 transition-colors text-sm">
                  Videolar
                </a>
              </li>
              <li>
                <a href="/blog" className="text-zinc-400 hover:text-green-500 transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="/hakkimizda" className="text-zinc-400 hover:text-green-500 transition-colors text-sm">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="/istatistikler" className="text-zinc-400 hover:text-green-500 transition-colors text-sm">
                  İstatistikler
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-green-500 font-semibold mb-4">Bize Ulaşın</h4>
            <div className="space-y-3">
              <a
                href="https://youtube.com/@bobinkardesler"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-zinc-400 hover:text-green-500 transition-colors text-sm group"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>YouTube Kanalımız</span>
              </a>
              <a
                href="mailto:info@bobinkardesler.com"
                className="flex items-center space-x-3 text-zinc-400 hover:text-green-500 transition-colors text-sm group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>info@bobinkardesler.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800">
          <div className="text-center space-y-3">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} Bobin Kardeşler. Tüm hakları saklıdır.
            </p>
            <div className="text-zinc-600 text-xs">
              <p className="mb-1">
                Bu site Bobin Kardeşler'den <span className="text-green-500 font-semibold">Bahadır</span> tarafından yapılmıştır.
              </p>
              <p>
                Sizin de böyle bir siteniz olmasını ister misiniz?{' '}
                <a
                  href="mailto:Theworld1716@gmail.com"
                  className="text-green-500 hover:text-green-400 transition-colors font-semibold"
                >
                  Theworld1716@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
