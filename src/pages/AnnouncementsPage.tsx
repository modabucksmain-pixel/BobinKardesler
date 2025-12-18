import { useEffect, useState } from 'react';
import { Bell, Calendar, ArrowUpRight } from 'lucide-react';
import { getPublishedAnnouncements, type Announcement } from '../lib/announcements';
import { formatDate } from '../lib/youtube';
import { PageLayout } from '../components/PageLayout';

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    const data = await getPublishedAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  }

  return (
    <PageLayout
      title="Güncel duyurular ve hatırlatmalar"
      description="Yayın planları, canlı yayın tarihleri ve topluluk için önemli güncellemeler burada toplanıyor."
      eyebrow="Duyuru Panosu"
      actions={[{ label: 'Topluluk sayfasına git', href: '/topluluk' }]}
    >
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 text-lg">Şimdilik duyuru bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className="surface-panel relative overflow-hidden p-6 sm:p-8"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-green-500/5 to-transparent pointer-events-none" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-[0.25em]">
                    <Bell className="h-4 w-4 text-green-400" />
                    <span>Yeni paylaşım</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{announcement.title}</h2>
                  <p className="text-zinc-300 leading-relaxed">{announcement.content}</p>
                  {announcement.link && (
                    <a
                      href={announcement.link}
                      className="inline-flex items-center gap-2 text-sm text-green-300 font-semibold hover:text-green-100"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Dış bağlantı
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 text-sm text-zinc-400">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <Calendar className="h-4 w-4 text-green-300" />
                    <span>{formatDate(announcement.created_at)}</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-green-300">Topluluk yayını</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
