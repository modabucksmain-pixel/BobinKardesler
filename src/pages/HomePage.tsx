import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  ThumbsUp,
  Video,
  Users,
  Play,
  Bell,
  Calendar,
  Sparkles,
  Activity,
  ShieldCheck,
  Radio,
  Rocket,
  Cpu,
  Waves,
  ArrowUpRight,
  BookOpen,
  Trophy,
  Megaphone,
} from 'lucide-react';
import { getChannelStats, getLatestVideos, formatNumber, formatDate, type YouTubeVideo, type ChannelStats } from '../lib/youtube';
import { supabase } from '../lib/supabase';
import { getPublishedAnnouncements, type Announcement } from '../lib/announcements';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  slug: string;
  published_at: string;
}

export function HomePage() {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const featureHighlights = useMemo(
    () => [
      {
        title: 'Elektrik Lab',
        description: 'Gerçek zamanlı deneyler, devre kurulumları ve atölyeden sahne arkası paylaşımlar.',
        icon: <Activity className="w-6 h-6" />,
        accent: 'Canlı',
      },
      {
        title: 'Projeler & Şemalar',
        description: 'PCB tasarımlarından mikrodenetleyici entegrasyonlarına kadar tüm dokümantasyon tek sayfada.',
        icon: <Cpu className="w-6 h-6" />,
        accent: 'Yeni',
      },
      {
        title: 'Topluluk Meydanı',
        description: 'Anketler, çekilişler ve haftalık meydan okumalarla aktif bir maker topluluğu.',
        icon: <Radio className="w-6 h-6" />,
        accent: 'Interaktif',
      },
    ],
    [],
  );

  const learningTracks = useMemo(
    () => [
      {
        title: 'Güç ve Kontrol',
        status: 'Yolculuk',
        progress: 78,
        description: 'Motor sürücüleri, güç elektroniği ve endüstriyel otomasyon odaklı modüller.',
      },
      {
        title: 'PCB & IoT',
        status: 'Hızlanıyor',
        progress: 64,
        description: 'Kart tasarımı, kablosuz haberleşme ve sensör füzyonu ile uçtan uca IoT setleri.',
      },
      {
        title: 'Maker Akademi',
        status: 'Açık sınıf',
        progress: 92,
        description: 'Adım adım video dersleri, kaynak kodları ve baskı listeleriyle kendi hızında öğren.',
      },
    ],
    [],
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [channelStats, latestVideos, blogData, announcementData] = await Promise.all([
      getChannelStats(),
      getLatestVideos(8),
      supabase
        .from('blog_posts')
        .select('id, title, excerpt, featured_image, slug, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3),
      getPublishedAnnouncements(3),
    ]);

    setStats(channelStats);
    setVideos(latestVideos);
    if (blogData.data) setBlogPosts(blogData.data);
    setAnnouncements(announcementData);
    setLoading(false);
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 electric-gradient grid-overlay opacity-60"></div>
      <div className="absolute inset-0 aurora animate-aurora"></div>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-10 -top-20 w-64 h-64 rounded-full bg-green-500/20 blur-3xl animate-glow-loop"></div>
          <div className="absolute right-10 top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl animate-glow-loop"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_45%)]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-xs uppercase tracking-[0.25em] text-zinc-300">Elektrik & Teknoloji Üssü</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="text-zinc-50">Bobin</span>{' '}
                <span className="text-green-400 glow-text">Kardeşler</span>
                <span className="block text-2xl sm:text-3xl text-zinc-300 mt-3 font-semibold">Underground Elektrik & Maker Platformu</span>
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Atölyeden yükselen enerjiyle devreler, projeler ve eğitim içerikleri. Videolar, şemalar ve topluluk etkinlikleri artık tek ekranda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/videos"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-green-500 text-zinc-950 font-semibold shadow-lg shadow-green-500/30 hover:-translate-y-1 transition-transform duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Videoları İzle
              </a>
              <a
                href="/projeler"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors duration-300"
              >
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Projeleri Keşfet
              </a>
              <div className="flex items-center space-x-2 text-sm text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Gerçek malzeme listeleri ve kaynak kodlar</span>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<Users className="w-6 h-6" />} value={formatNumber(stats.subscriberCount)} label="Abone" />
                <StatCard icon={<Eye className="w-6 h-6" />} value={formatNumber(stats.viewCount)} label="Toplam İzlenme" />
                <StatCard icon={<Video className="w-6 h-6" />} value={formatNumber(stats.videoCount)} label="Video" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featureHighlights.map((item) => (
                <div
                  key={item.title}
                  className="relative border border-green-500/10 bg-white/5 rounded-xl p-5 hover:border-green-500/40 transition-all duration-300 glass-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400">{item.icon}</div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-green-500/15 text-green-400 font-semibold">{item.accent}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-50 mb-1">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-2xl glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                    <Waves className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-[0.2em]">Stüdyo Akışı</p>
                    <p className="text-lg font-semibold text-zinc-100">Son kayıtlar</p>
                  </div>
                </div>
                <div className="text-xs text-green-400 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">Güncel</div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 mb-5">
                {videos[0] ? (
                  <a href={`https://youtube.com/watch?v=${videos[0].id}`} target="_blank" rel="noopener noreferrer" className="group block">
                    <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                      <img
                        src={videos[0].thumbnail}
                        alt={videos[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-green-500 text-zinc-950 rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                          <Play className="w-7 h-7 ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm uppercase tracking-[0.2em] text-green-400">Yeni video</p>
                      <h3 className="text-xl font-semibold text-zinc-50 leading-snug group-hover:text-green-400 transition-colors">{videos[0].title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-zinc-400">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(videos[0].viewCount)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{formatNumber(videos[0].likeCount)}</span>
                        </span>
                        <span>{formatDate(videos[0].publishedAt)}</span>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="aspect-video bg-zinc-900 flex items-center justify-center text-zinc-500">Henüz video yok.</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <QuickLink href="/topluluk" icon={<Megaphone className="w-4 h-4" />} title="Topluluk meydanı" />
                <QuickLink href="/video-fikirleri" icon={<Sparkles className="w-4 h-4" />} title="Fikir gönder" />
                <QuickLink href="/cekilisler" icon={<Trophy className="w-4 h-4" />} title="Çekilişlere katıl" />
                <QuickLink href="/duyurular" icon={<Bell className="w-4 h-4" />} title="Duyurular" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 rounded-3xl blur-3xl"></div>
          <div className="relative border border-zinc-800 bg-zinc-950/60 rounded-3xl p-8 glass-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                  <Bell className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50">Duyuru Akışı</h2>
                  <p className="text-zinc-500 text-sm">Yayınlar, etkinlikler ve stüdyo güncellemeleri</p>
                </div>
              </div>
              <a href="/duyurular" className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center">
                Tümünü Gör <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className="relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500/60 via-emerald-400/40 to-green-500/60 animate-line-flow"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center text-xs text-zinc-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(announcement.publish_at)}
                    </span>
                    <span className="px-2 py-1 text-[11px] font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                      Öncelik {announcement.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-50 mb-2 line-clamp-2">{announcement.title}</h3>
                  {announcement.summary && <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{announcement.summary}</p>}
                  <a href="/duyurular" className="text-green-400 font-semibold text-sm inline-flex items-center">
                    Detaylar <ArrowUpRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-2">Son Videolar</h2>
            <p className="text-zinc-500">Atölyeden taze kayıtlar, proje yürüyüşleri ve ipuçları</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 text-sm text-zinc-400">
              <Rocket className="w-4 h-4 text-green-400" />
              <span>7/24 öğrenme</span>
            </div>
            <a href="/videos" className="text-green-400 hover:text-green-300 transition-colors font-semibold text-sm">
              Tümünü Gör →
            </a>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 animate-pulse bg-zinc-900 h-[360px] rounded-2xl"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-zinc-900 h-28 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-zinc-950/60 group">
                <a href={`https://youtube.com/watch?v=${videos[0].id}`} target="_blank" rel="noopener noreferrer">
                  <div className="aspect-video relative bg-zinc-900 overflow-hidden">
                    <img
                      src={videos[0].thumbnail}
                      alt={videos[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 inline-flex items-center space-x-2 bg-green-500 text-zinc-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      <Play className="w-4 h-4" />
                      <span>En Son</span>
                    </div>
                  </div>
                </a>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>{formatNumber(videos[0].viewCount)} izlenme</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{formatNumber(videos[0].likeCount)} beğeni</span>
                    </div>
                    <span>{formatDate(videos[0].publishedAt)}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-zinc-50 leading-snug hover:text-green-400 transition-colors">{videos[0].title}</h3>
                  <p className="text-sm text-zinc-400">Projeyi detaylı incele, şema ve malzeme listesi için açıklamayı ziyaret et.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {videos.slice(1, 7).map((video, index) => (
                <VideoCard key={video.id} video={video} index={index + 1} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-lg">Henüz video yok.</p>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-zinc-50">Öğrenme Yolları</h2>
                <p className="text-zinc-500 text-sm">Elektrik temelinden ileri seviye otomasyona kadar modüler içerikler</p>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-green-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Güncel kaynak kodlar</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {learningTracks.map((track) => (
                <div
                  key={track.title}
                  className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 hover:border-green-500/30 transition-all duration-300 glass-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-zinc-50">{track.title}</h3>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 font-semibold border border-green-500/20">{track.status}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">{track.description}</p>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${track.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">Tamamlanma: {track.progress}%</p>
                </div>
              ))}
            </div>

            {blogPosts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-zinc-50">Maker Akademi Blog</h2>
                    <p className="text-zinc-500 text-sm">Kılavuzlar, ipuçları ve deney notları</p>
                  </div>
                  <a href="/blog" className="text-green-400 hover:text-green-300 text-sm font-semibold">
                    Tümünü Gör →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {blogPosts.map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-zinc-950 to-zinc-950 shadow-xl glass-card">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-green-400">Hızlı Başlangıç</p>
                  <h3 className="text-xl font-semibold text-zinc-50">Atölyeye katıl</h3>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-zinc-200">
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Projeler sayfasından devre şemaları ve malzeme listelerine ulaş.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Topluluk sekmesinde haftalık meydan okumaya dahil ol.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Blog yazılarıyla birlikte kaynak kodlarını indir.</span>
                </li>
              </ul>
              <a href="/projeler" className="mt-4 inline-flex items-center text-green-400 font-semibold hover:text-green-300">
                Rehbere git <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 glass-card space-y-4">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Haftanın meydan okuması</p>
                  <h3 className="text-lg font-semibold text-zinc-50">Yüksek verimli güç kaynağı</h3>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">Tasarımını paylaş, çekiliş puanı kazan ve toplulukta öne çıkanlar listesine gir.</p>
              <a href="/topluluk" className="inline-flex items-center text-green-400 font-semibold hover:text-green-300">
                Katıl <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {blogPosts.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center border border-zinc-800 rounded-2xl p-10 bg-zinc-950/70">
            <BookOpen className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Yeni blog yazıları yolda</h3>
            <p className="text-zinc-500">Elektrik ve teknoloji üzerine taze notlar çok yakında burada olacak.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-1">
      <div className="text-green-400 mb-2 flex justify-between items-center">
        <span className="p-2 rounded-lg bg-green-500/10">{icon}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Canlı</span>
      </div>
      <div className="text-2xl font-bold text-zinc-50 mb-1">{value}</div>
      <div className="text-zinc-500 text-xs uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function VideoCard({ video, index }: { video: YouTubeVideo; index: number }) {
  return (
    <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="relative overflow-hidden rounded-xl mb-3 aspect-video bg-zinc-900 border border-zinc-800 group-hover:border-green-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <Play className="w-7 h-7 text-zinc-950 ml-1" />
          </div>
        </div>
      </div>
      <h3 className="text-base font-semibold text-zinc-100 mb-2 group-hover:text-green-400 transition-colors line-clamp-2">{video.title}</h3>
      <div className="flex items-center space-x-4 text-sm text-zinc-400">
        <span className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{formatNumber(video.viewCount)}</span>
        </span>
        <span className="flex items-center space-x-1">
          <ThumbsUp className="w-4 h-4" />
          <span>{formatNumber(video.likeCount)}</span>
        </span>
        <span>{formatDate(video.publishedAt)}</span>
      </div>
    </a>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a href={`/blog/${post.slug}`} className="group block animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
        {post.featured_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-zinc-100 mb-2 group-hover:text-green-500 transition-colors line-clamp-2">{post.title}</h3>
          {post.excerpt && <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>}
          <p className="text-green-500 text-sm font-semibold">Devamını Oku →</p>
        </div>
      </div>
    </a>
  );
}

function QuickLink({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/70 text-zinc-200 hover:border-green-500/40 hover:text-green-300 transition-all duration-300"
    >
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">{icon}</div>
        <span className="font-semibold">{title}</span>
      </div>
      <ArrowUpRight className="w-4 h-4" />
    </a>
  );
}
