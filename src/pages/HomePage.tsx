import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  ThumbsUp,
  Video,
  Users,
  Play,
  Bell,
  Calendar,
  Sparkles,
  ShieldCheck,
  Rocket,
  Waves,
  ArrowUpRight,
  BookOpen,
  Trophy,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getChannelStats, getLatestVideos, formatNumber, formatDate, type YouTubeVideo, type ChannelStats } from '../lib/youtube';
import { supabase } from '../lib/supabase';
import { getPublishedAnnouncements, type Announcement } from '../lib/announcements';
import { getCommunityPosts, type CommunityPost } from '../lib/community';
import { useNotification } from '../contexts/NotificationContext';

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
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { error: showError } = useNotification();

  const quickMenuItems = useMemo(
    () => [
      {
        href: '/topluluk',
        title: 'Topluluk meydanı',
        description: 'Duyurular, buluşmalar ve ekip içi güncellemeler',
        icon: <Megaphone className="w-5 h-5" />,
      },
      {
        href: '/video-fikirleri',
        title: 'Fikir gönder',
        description: 'Atölye gündemine öneri veya problem ekle',
        icon: <Sparkles className="w-5 h-5" />,
      },
      {
        href: '/cekilisler',
        title: 'Çekilişlere katıl',
        description: 'Devam eden ödül havuzlarını ve katılım şartlarını gör',
        icon: <Trophy className="w-5 h-5" />,
      },
      {
        href: '/duyurular',
        title: 'Duyurular',
        description: 'Yeni yayınlar, canlı yayın takvimi ve stüdyo günlüğü',
        icon: <Bell className="w-5 h-5" />,
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
    setErrorMessage(null);

    try {
      const [channelStats, latestVideos, blogResult, announcementResult, communityData] = await Promise.all([
        getChannelStats(),
        getLatestVideos(8),
        supabase
          .from('blog_posts')
          .select('id, title, excerpt, featured_image, slug, published_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3),
        getPublishedAnnouncements(3),
        getCommunityPosts(3),
      ]);

      let hasError = false;

      setStats(channelStats);
      setVideos(latestVideos);

      if (blogResult.error) {
        hasError = true;
      } else if (blogResult.data) {
        setBlogPosts(blogResult.data);
      }

      if (announcementResult.error) {
        hasError = true;
      } else {
        setAnnouncements(announcementResult.data);
      }

      setCommunityPosts(communityData);

      if (hasError) {
        const message = 'Beklenmeyen bir hata oluştu, lütfen daha sonra tekrar dene.';
        setErrorMessage(message);
        showError(message);
      }
    } catch (error) {
      console.error('Home page data load error', error);
      const message = 'Beklenmeyen bir hata oluştu, lütfen daha sonra tekrar dene.';
      setErrorMessage(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-100 p-4 text-sm">
            {errorMessage}
          </div>
        </div>
      )}

      <section className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-300">Elektrik & Teknoloji Üssü</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                Bobin <span className="text-green-400 glow-text">Kardeşler</span>
                <span className="block text-xl sm:text-2xl text-zinc-300 mt-2 font-semibold">Underground Elektrik & Maker Platformu</span>
              </h1>
              <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl">
                Daha yalın bir vitrin ile videoları, projeleri ve topluluk duyurularını hızlıca keşfet. Mobil ve masaüstü için optimize edildi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/videos"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-green-500 text-zinc-950 font-semibold shadow-lg shadow-green-500/30 hover:-translate-y-0.5 transition-transform"
              >
                <Play className="w-5 h-5 mr-2" />
                Videoları İzle
              </a>
              <a
                href="/projeler"
                className="inline-flex items-center px-5 py-3 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
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

          </div>

          <div className="relative bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-xl">
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

              <ScrollableMenu items={quickMenuItems} />
            </div>
          </div>
      </section>

      {communityPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                <Megaphone className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-zinc-50">Topluluk Duyuruları</h2>
                <p className="text-zinc-500 text-sm">Ekipten son paylaşımlar ve sabitlenen içerikler</p>
              </div>
            </div>
            <a href="/topluluk" className="text-green-400 hover:text-green-300 text-sm font-semibold inline-flex items-center">
              Topluluğa git <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityPosts.map((post, index) => (
              <div
                key={post.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.created_at)}
                  </span>
                  {post.pinned && (
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 font-semibold">
                      Sabit
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
                <div
                  className="text-sm text-zinc-300 line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <a
                  href="/topluluk"
                  className="mt-4 inline-flex items-center text-green-400 font-semibold text-sm hover:text-green-300"
                >
                  Detaya git <ArrowUpRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

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
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-semibold">
              Sadece uzun format videolar listelenir (Shorts gizlendi)
            </div>
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

interface MenuItem {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function ScrollableMenu({ items }: { items: MenuItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateActiveIndex = () => {
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      const nearestIndex = children.reduce(
        (closest, child, index) => {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const distance = Math.abs(containerCenter - childCenter);
          return distance < closest.distance ? { index, distance } : closest;
        },
        { index: 0, distance: Infinity },
      ).index;

      setActiveIndex(nearestIndex);
    };

    updateActiveIndex();
    container.addEventListener('scroll', updateActiveIndex, { passive: true });
    return () => container.removeEventListener('scroll', updateActiveIndex);
  }, [items.length]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const target = container.children[index] as HTMLElement | undefined;
    if (!target) return;

    const offset = target.offsetLeft - container.offsetLeft;
    container.scrollTo({ left: offset, behavior: 'smooth' });
  };

  const handlePrevious = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const handleNext = () => scrollToIndex(Math.min(items.length - 1, activeIndex + 1));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-inner">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          <Sparkles className="h-4 w-4 text-green-400" />
          <span>Hızlı geçiş</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={activeIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-green-400/50 hover:text-green-200 disabled:opacity-40"
            aria-label="Önceki kısayol"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === items.length - 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-green-400/50 hover:text-green-200 disabled:opacity-40"
            aria-label="Sonraki kısayol"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-transparent" />

        <div
          ref={containerRef}
          className="scrollbar-hidden flex gap-3 overflow-x-auto pb-2 pr-2 snap-x snap-mandatory"
          aria-label="Kısayol menüsü"
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative min-w-[230px] snap-center rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:border-green-400/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-500/10 text-green-400 shadow-inner">
                  {item.icon}
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-400 transition group-hover:text-green-300" />
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition group-hover:opacity-100">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
                <div className="absolute inset-0 rounded-xl border border-green-500/20" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.href}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={`h-2.5 rounded-full transition ${
              activeIndex === index
                ? 'w-6 bg-green-400 shadow shadow-green-500/30'
                : 'w-2 bg-zinc-700 hover:bg-zinc-500'
            }`}
            aria-label={`${item.title} bağlantısına git`}
          />
        ))}
      </div>
    </div>
  );
}
