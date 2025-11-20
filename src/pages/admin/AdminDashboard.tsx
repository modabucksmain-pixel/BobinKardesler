import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getChannelStats, type ChannelStats, formatNumber } from '../../lib/youtube';
import {
  FileText,
  Video,
  Users,
  Eye,
  Plus,
  Lightbulb,
  Gift,
  MessageSquare,
  Wrench,
  BarChart3,
  Mail,
  Bell,
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [blogCount, setBlogCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [suggestionsCount, setSuggestionsCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [pollCount, setPollCount] = useState(0);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadStats();
    }
  }, [user, authLoading]);

  async function loadStats() {
    setLoading(true);
    const [
      channelStats,
      blogData,
      viewsData,
      suggestionsData,
      announcementData,
      projectData,
      pollData,
      newsletterData,
    ] = await Promise.all([
      getChannelStats(),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('views'),
      supabase.from('video_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('announcements').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('polls').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter_signups').select('id', { count: 'exact', head: true }),
    ]);

    setStats(channelStats);
    setBlogCount(blogData.count || 0);
    setTotalViews(viewsData.data?.reduce((sum, post) => sum + post.views, 0) || 0);
    setSuggestionsCount(suggestionsData.count || 0);
    setAnnouncementCount(announcementData.count || 0);
    setProjectCount(projectData.count || 0);
    setPollCount(pollData.count || 0);
    setNewsletterCount(newsletterData.count || 0);
    setLoading(false);
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout
      title="Admin Paneli"
      description={user?.email ? `Hoş geldiniz, ${user.email}` : 'Kontrol ve içerik yönetimi'}
      actions={[{ label: 'Yeni Blog Yazısı', href: '/admin/blog/new' }, { label: 'Site Ayarları', href: '/admin/settings' }]}
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 border border-white/5 rounded-2xl h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-12">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="YouTube Aboneleri"
            value={stats ? formatNumber(stats.subscriberCount) : '0'}
            color="yellow"
          />
          <StatCard
            icon={<Video className="w-6 h-6" />}
            label="Toplam Video"
            value={stats ? formatNumber(stats.videoCount) : '0'}
            color="yellow"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Blog Yazıları"
            value={blogCount.toString()}
            color="yellow"
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="Blog Görüntülenmeleri"
            value={formatNumber(totalViews.toString())}
            color="yellow"
          />
          <StatCard
            icon={<Lightbulb className="w-6 h-6" />}
            label="Bekleyen Öneriler"
            value={suggestionsCount.toString()}
            color="green"
          />
          <StatCard
            icon={<Bell className="w-6 h-6" />}
            label="Duyurular"
            value={announcementCount.toString()}
            color="green"
          />
          <StatCard
            icon={<Wrench className="w-6 h-6" />}
            label="Projeler"
            value={projectCount.toString()}
            color="yellow"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Anketler"
            value={pollCount.toString()}
            color="yellow"
          />
          <StatCard
            icon={<Mail className="w-6 h-6" />}
            label="Bülten Kayıtları"
            value={newsletterCount.toString()}
            color="green"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <ActionCard
          title="Blog Yönetimi"
          description="Blog yazılarını görüntüle, düzenle veya yeni yazı oluştur"
          icon={<FileText className="w-8 h-8" />}
          actions={[
            { label: 'Yeni Yazı', href: '/admin/blog/new', icon: <Plus className="w-4 h-4" /> },
            { label: 'Tüm Yazılar', href: '/admin/blog' },
          ]}
        />

        <ActionCard
          title="Çekiliş Yönetimi"
          description="Çekilişleri oluştur, yönet ve kazanan seç"
          icon={<Gift className="w-8 h-8" />}
          actions={[{ label: 'Çekilişleri Yönet', href: '/admin/cekilisler' }]}
        />

        <ActionCard
          title="Video Önerileri"
          description="Kullanıcı önerilerini görüntüle ve yönet"
          icon={<Lightbulb className="w-8 h-8" />}
          actions={[{ label: 'Önerileri Yönet', href: '/admin/video-suggestions' }]}
        />

        <ActionCard
          title="Topluluk Duyuruları"
          description="Topluluk duyurularını oluştur ve yönet"
          icon={<MessageSquare className="w-8 h-8" />}
          actions={[{ label: 'Duyuruları Yönet', href: '/admin/community' }]}
        />

        <ActionCard
          title="Site Duyuruları"
          description="Ana sayfa duyurularını yönet ve yayınla"
          icon={<Bell className="w-8 h-8" />}
          actions={[{ label: 'Duyuruları Yönet', href: '/admin/announcements' }]}
        />

        <ActionCard
          title="Proje Galerisi"
          description="Projeleri ekle, düzenle ve yönet"
          icon={<Wrench className="w-8 h-8" />}
          actions={[{ label: 'Projeleri Yönet', href: '/admin/projects' }]}
        />

        <ActionCard
          title="Anketler"
          description="Topluluk anketleri oluştur ve yönet"
          icon={<BarChart3 className="w-8 h-8" />}
          actions={[{ label: 'Anketleri Yönet', href: '/admin/polls' }]}
        />

        <ActionCard
          title="Bülten Aboneleri"
          description="E-posta abonelerini görüntüle"
          icon={<Mail className="w-8 h-8" />}
          actions={[{ label: 'Aboneleri Görüntüle', href: '/admin/newsletter' }]}
        />

        <ActionCard
          title="Site Ayarları"
          description="YouTube API anahtarı, kanal ID ve diğer site ayarları"
          icon={<Video className="w-8 h-8" />}
          actions={[{ label: 'Ayarları Düzenle', href: '/admin/settings' }]}
        />
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 md:p-6 hover:border-green-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10 animate-scale-in">
      <div className={`text-${color}-500 mb-3`}>{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-zinc-100 mb-1">{value}</div>
      <div className="text-zinc-400 text-xs md:text-sm">{label}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  actions,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: Array<{ label: string; href: string; icon?: React.ReactNode }>;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 md:p-6 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 animate-scale-in">
      <div className="flex items-start space-x-4 mb-4">
        <div className="p-3 bg-green-500/10 rounded-lg text-green-500">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-zinc-100 mb-2">{title}</h3>
          <p className="text-zinc-400 text-xs md:text-sm">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors font-semibold text-xs md:text-sm"
          >
            {action.icon}
            <span>{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
