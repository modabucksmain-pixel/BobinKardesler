import { Zap, Youtube, Mail } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            Hakkımızda
          </h1>
          <p className="text-zinc-400 text-lg">
            Underground elektrik ve elektronik dünyasından
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Zap className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-500">Bobin Kardeşler</h2>
            </div>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-zinc-300 leading-relaxed mb-4">
                Bobin Kardeşler olarak, elektrik, elektronik ve underground teknoloji dünyasında
                projeler geliştiriyor, deneyler yapıyor ve bilgilerimizi toplulukla paylaşıyoruz.
              </p>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Amacımız, elektrik ve elektronik alanında meraklı, öğrenmeye açık ve yaratıcı
                düşünen kişilere ilham vermek ve pratik bilgiler sunmaktır.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Projelerimiz, deneylerimiz ve eğitim içeriklerimizle beraber, teknolojinin
                sınırlarını zorluyor ve her gün yeni şeyler öğreniyoruz.
              </p>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-green-500 mb-6">İçeriklerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-100">YouTube Videoları</h3>
                <ul className="space-y-2 text-zinc-300">
                  <li>• Elektrik ve elektronik projeleri</li>
                  <li>• Devre tasarımı ve analizi</li>
                  <li>• Arduino ve mikrodenetleyici projeleri</li>
                  <li>• Yüksek voltaj deneyleri</li>
                  <li>• DIY elektrik araçları</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-100">Blog Yazıları</h3>
                <ul className="space-y-2 text-zinc-300">
                  <li>• Teknik makaleler ve analizler</li>
                  <li>• Proje dokümantasyonları</li>
                  <li>• Eğitim içerikleri</li>
                  <li>• İpuçları ve püf noktaları</li>
                  <li>• Sektör haberleri</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-green-500 mb-6">İletişim</h2>
            <div className="space-y-4">
              <a
                href="https://youtube.com/@bobinkardesler"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
              >
                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Youtube className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-green-500 transition-colors">
                    YouTube Kanalımız
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Videolarımızı izleyin ve abone olun
                  </p>
                </div>
              </a>

              <a
                href="mailto:info@bobinkardesler.com"
                className="flex items-center space-x-4 p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
              >
                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Mail className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-green-500 transition-colors">
                    E-posta
                  </h3>
                  <p className="text-sm text-zinc-400">info@bobinkardesler.com</p>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
