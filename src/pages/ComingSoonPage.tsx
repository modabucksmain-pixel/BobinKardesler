import { ArrowLeft, Clock, Rocket, Sparkles, Ticket, Zap } from 'lucide-react';
import { Link as AppLink } from '../components/Link';

const upcomingFeatures = [
  {
    title: 'Haber akışı',
    description: 'Toplulukta olup bitenleri keşfetmek için yeni akış sayfası hazırlanıyor.',
  },
  {
    title: 'Alınan ifadeler',
    description: 'Forum ve yorumlarda sana gelen yanıtları tek panelden takip edebileceksin.',
  },
  {
    title: 'Tüm içeriğin',
    description: 'Paylaştığın gönderiler, projeler ve blog katkıları tek listede toplanacak.',
  },
  {
    title: 'Bildirim merkezi',
    description: 'Uyarılar, hatırlatmalar ve topluluk etkinlikleri için akıllı bildirimler geliyor.',
  },
  {
    title: 'Şifre ve güvenlik',
    description: 'Güvenli giriş seçenekleri ve iki adımlı doğrulama üzerinde çalışılıyor.',
  },
  {
    title: 'Takip ettiklerim',
    description: 'Favori içerik üreticilerini ve forum başlıklarını takip edebileceksin.',
  },
  {
    title: 'Gizlilik',
    description: 'Görünürlük tercihlerini ve veri paylaşımını kontrol edebileceğin yeni ayarlar hazırlanıyor.',
  },
  {
    title: 'Kara liste',
    description: 'Engellediğin kullanıcıları ve içerikleri yöneteceğin merkezi bir alan geliyor.',
  },
  {
    title: 'Sosyal seçenekler',
    description: 'Paylaşım bağlantıları ve profil etkileşimlerini yönetebileceğin sosyal araçlar tasarlanıyor.',
  },
];

export function ComingSoonPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-white px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="relative overflow-hidden rounded-3xl border border-green-500/30 bg-green-500/5 p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.25),_transparent_45%)]" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-green-200">
              <Sparkles className="h-4 w-4" />
              Geliştiriliyor
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
              Yeni özellikler çok yakında burada olacak
            </h1>
            <p className="text-lg text-green-100/80 max-w-2xl">
              Topluluk deneyimini güçlendirmek için çalışıyoruz. Şimdilik bizi takipte kal, güncellemeler bu sayfada paylaşılacak.
            </p>
            <div className="flex flex-wrap gap-3">
              <AppLink
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-zinc-950 px-4 py-2 font-semibold shadow-lg shadow-green-500/30 hover:-translate-y-0.5 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Ana sayfaya dön
              </AppLink>
              <AppLink
                href="/account"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white hover:border-green-400/60 hover:bg-white/15 transition"
              >
                <Ticket className="h-4 w-4" />
                Hesap ayarlarına geri dön
              </AppLink>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 hover:border-green-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-300 border border-green-500/30 shadow-inner">
                  {index % 2 === 0 ? <Rocket className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">{feature.description}</p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-green-200 border border-white/10">
                    <Clock className="h-4 w-4" />
                    Yakında
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ComingSoonPage;
