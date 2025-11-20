import { useEffect, useState } from 'react';
import { TrendingUp, Eye, Video, FileText, Users, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getChannelStats, type ChannelStats, formatNumber } from '../lib/youtube';

interface BlogStats {
  total_posts: number;
  total_views: number;
  total_comments: number;
}

export function AnalyticsPage() {
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);

    const [channel, blogPostsData, blogCommentsData] = await Promise.all([
      getChannelStats(),
      supabase
        .from('blog_posts')
        .select('views')
        .eq('status', 'published'),
      supabase
        .from('blog_comments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),
    ]);

    setChannelStats(channel);

    if (blogPostsData.data) {
      const totalViews = blogPostsData.data.reduce((sum, post) => sum + (post.views || 0), 0);
      setBlogStats({
        total_posts: blogPostsData.data.length,
        total_views: totalViews,
        total_comments: blogCommentsData.count || 0,
      });
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-zinc-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-zinc-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-6">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            İstatistikler
          </h1>
          <p className="text-zinc-400 text-lg">
            Platform genelinde performans ve büyüme metrikleri
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center space-x-2">
            <Video className="w-6 h-6 text-green-500" />
            <span>YouTube Kanalı</span>
          </h2>
          {channelStats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                icon={<Users className="w-8 h-8" />}
                value={formatNumber(channelStats.subscriberCount)}
                label="Toplam Abone"
                color="text-blue-500"
                bgColor="bg-blue-500/10"
              />
              <StatCard
                icon={<Eye className="w-8 h-8" />}
                value={formatNumber(channelStats.viewCount)}
                label="Toplam İzlenme"
                color="text-green-500"
                bgColor="bg-green-500/10"
              />
              <StatCard
                icon={<Video className="w-8 h-8" />}
                value={formatNumber(channelStats.videoCount)}
                label="Toplam Video"
                color="text-purple-500"
                bgColor="bg-purple-500/10"
              />
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-green-500" />
            <span>Blog İstatistikleri</span>
          </h2>
          {blogStats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                icon={<FileText className="w-8 h-8" />}
                value={blogStats.total_posts.toString()}
                label="Yayınlanan Yazı"
                color="text-orange-500"
                bgColor="bg-orange-500/10"
              />
              <StatCard
                icon={<Eye className="w-8 h-8" />}
                value={formatNumber(blogStats.total_views.toString())}
                label="Toplam Görüntülenme"
                color="text-green-500"
                bgColor="bg-green-500/10"
              />
              <StatCard
                icon={<Activity className="w-8 h-8" />}
                value={blogStats.total_comments.toString()}
                label="Toplam Yorum"
                color="text-pink-500"
                bgColor="bg-pink-500/10"
              />
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
          <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-zinc-100 mb-2">
            Sürekli Büyüyoruz!
          </h3>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Bobin Kardeşler topluluğu her gün daha da büyüyor. Siz de bu harika ailenin bir parçası olun,
            underground elektrik dünyasına katılın!
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300">
      <div className={`${bgColor} ${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-zinc-100 mb-1">{value}</div>
      <div className="text-zinc-500 text-sm font-medium">{label}</div>
    </div>
  );
}
