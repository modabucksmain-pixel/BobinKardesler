import { useEffect, useState } from 'react';
import { Eye, ThumbsUp, Video, Users, Play, Bell, Calendar } from 'lucide-react';
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

const featurePillars = [
  {
    title: 'Hızlı Başlangıç Atölyeleri',
    description: 'Elektrik ve elektronik temelinde uygulamalı mini atölyelerle adım adım ilerleyin.',
    badge: 'Yeni',
  },
  {
    title: 'Topluluk Mücadeleleri',
    description: 'Aylık proje görevleriyle becerilerinizi sınayın, ödülleri ve öne çıkmayı kazanın.',
    badge: 'Haftalık',
  },
  {
    title: 'Canlı Laboratuvar Akışı',
    description: 'Devam eden projeleri canlı olarak takip edin, sorular sorun ve birlikte çözelim.',
    badge: 'Canlı',
  },
];

const discoveryCards = [
  {
    title: 'Arduino & Mikrodenetleyici Paketi',
    description: 'Başlangıç seviyesinden ileri seviyeye ilerleyen pratik, kaynak ve koda hazır paket.',
    href: '/projeler',
  },
  {
    title: 'Yeraltı Enerji Serisi',
    description: 'Endüstriyel enerji çözümlerini gerçek örneklerle anlattığımız özel video serisi.',
    href: '/videos',
  },
  {
    title: 'Topluluk Vitrini',
    description: 'Abonelerden gelen en yaratıcı proje paylaşımlarını haftalık olarak yayınlıyoruz.',
    href: '/topluluk',
  },
];

export function HomePage() {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [channelStats, latestVideos, blogData, announcementData] = await Promise.all([
      getChannelStats(),
      getLatestVideos(6),
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
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 electric-gradient"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDM0LDE5Nyw5NCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              <span className="text-zinc-100">Bobin</span>{' '}
              <span className="text-green-500 glow-text">Kardeşler</span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 mb-8 font-light tracking-wide">
              Underground Elektrik & Teknoloji
            </p>
          </div>

          <p className="text-base sm:text-lg text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Elektrik, elektronik ve teknoloji dünyasında yenilikçi projeler ve eğitim içerikleri üretiyoruz.
          </p>

          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <StatCard
                icon={<Users className="w-8 h-8" />}
                value={formatNumber(stats.subscriberCount)}
                label="Abone"
              />
              <StatCard
                icon={<Eye className="w-8 h-8" />}
                value={formatNumber(stats.viewCount)}
                label="Toplam İzlenme"
              />
              <StatCard
                icon={<Video className="w-8 h-8" />}
                value={formatNumber(stats.videoCount)}
                label="Video"
              />
            </div>
          )}

          <a
            href="/videos"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-green-500 text-zinc-950 font-bold rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 glow-box group relative overflow-hidden"
          >
            <div className="absolute inset-0 animate-shimmer"></div>
            <Play className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10">Videoları İzle</span>
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-green-500 rounded-full p-1">
            <div className="w-1.5 h-3 bg-green-500 rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featurePillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                  {pillar.badge}
                </span>
                <p className="text-sm text-zinc-500">Yeni özellik</p>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">{pillar.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Bell className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">Duyurular</h2>
                <p className="text-zinc-500 text-sm">Son yayınlanan site duyuruları</p>
              </div>
            </div>
            <a href="/duyurular" className="text-green-500 hover:text-green-400 text-sm font-semibold">
              Tümünü Gör →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center text-xs text-zinc-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(announcement.publish_at)}
                  </span>
                  <span className="px-2 py-1 text-[11px] font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                    Öncelik {announcement.priority}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 line-clamp-2">{announcement.title}</h3>
                {announcement.summary && (
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{announcement.summary}</p>
                )}
                <a href="/duyurular" className="text-green-500 font-semibold text-sm">Detaylar →</a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm text-green-400 font-semibold mb-2">Yeni Keşif Alanı</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">Koleksiyonlarımız</h2>
            <p className="text-zinc-500 text-sm md:text-base max-w-2xl">
              Bobin Kardeşler ekibinin elinden çıkan seçili koleksiyonlarla becerilerinizi pekiştirin. Her biri uygulamaya
              dönük içerik, kaynak ve hazır kodlarla dolu.
            </p>
          </div>
          <a href="/projeler" className="text-green-500 hover:text-green-400 text-sm font-semibold">
            Projeleri incele →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {discoveryCards.map((card, index) => (
            <a
              key={card.title}
              href={card.href}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 block"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                  Sürüm {index + 1}.0
                </span>
                <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 font-semibold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">{card.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">{card.description}</p>
              <span className="text-green-400 text-sm font-semibold">İncele →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">Son Videolar</h2>
            <p className="text-zinc-500">En yeni projeler ve içerikler</p>
          </div>
          <a
            href="/videos"
            className="text-green-500 hover:text-green-400 transition-colors font-medium text-sm"
          >
            Tümünü Gör →
          </a>
        </div>

        {loading ? (
          <div>
            <div className="animate-pulse mb-8">
              <div className="bg-zinc-800 h-96 rounded-2xl mb-4"></div>
              <div className="h-6 bg-zinc-800 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-zinc-800 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-zinc-800 rounded mb-2"></div>
                  <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : videos.length > 0 ? (
          <div>
            <div className="mb-12 relative group">
              <div className="absolute -top-4 -left-4 bg-green-500 text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm z-10 shadow-lg">
                En Son Yüklenen
              </div>
              <a
                href={`https://youtube.com/watch?v=${videos[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-video bg-zinc-900 border-2 border-green-500/30 group-hover:border-green-500 transition-all duration-300">
                  <img
                    src={videos[0].thumbnail}
                    alt={videos[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                      <Play className="w-12 h-12 text-zinc-950 ml-2" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-zinc-100 mb-3 group-hover:text-green-400 transition-colors">
                      {videos[0].title}
                    </h3>
                    <div className="flex items-center space-x-6 text-zinc-300">
                      <span className="flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold">{formatNumber(videos[0].viewCount)}</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-semibold">{formatNumber(videos[0].likeCount)}</span>
                      </span>
                      <span className="font-medium">{formatDate(videos[0].publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            {videos.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.slice(1, 6).map((video, index) => (
                  <VideoCard key={video.id} video={video} index={index + 1} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-lg">Henüz video yok.</p>
          </div>
        )}
      </section>

      {blogPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">Son Yazılar</h2>
              <p className="text-zinc-500">Blog ve eğitim içerikleri</p>
            </div>
            <a
              href="/blog"
              className="text-green-500 hover:text-green-400 transition-colors font-medium text-sm"
            >
              Tümünü Gör →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10 animate-scale-in group">
      <div className="text-green-500 mb-3 flex justify-center group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="text-3xl font-bold text-zinc-100 mb-1">{value}</div>
      <div className="text-zinc-500 text-sm uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

function VideoCard({ video, index }: { video: YouTubeVideo; index: number }) {
  return (
    <a
      href={`https://youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group animate-scale-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-xl mb-4 aspect-video bg-zinc-900 border border-zinc-800 group-hover:border-green-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <Play className="w-8 h-8 text-zinc-950 ml-1" />
          </div>
        </div>
      </div>
      <h3 className="text-base font-semibold text-zinc-100 mb-2 group-hover:text-green-500 transition-colors line-clamp-2">
        {video.title}
      </h3>
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
    <a
      href={`/blog/${post.slug}`}
      className="group block animate-scale-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
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
          <h3 className="text-xl font-semibold text-zinc-100 mb-2 group-hover:text-green-500 transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
          )}
          <p className="text-green-500 text-sm font-semibold">Devamını Oku →</p>
        </div>
      </div>
    </a>
  );
}
