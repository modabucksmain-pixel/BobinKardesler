import { useEffect, useState } from 'react';
import { Bell, Calendar, ArrowUpRight } from 'lucide-react';
import { getPublishedAnnouncements, type Announcement } from '../lib/announcements';
import { formatDate } from '../lib/youtube';

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
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-full mb-6">
            <Bell className="w-6 h-6 text-green-500" />
            <span className="text-green-500 font-semibold">Güncel Duyurular</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 mb-4 glow-text">
            Bobin Kardeşler Duyuruları
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Etkinlikler, güncellemeler ve topluluk için önemli hatırlatmalar bu alanda paylaşılıyor.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-zinc-900/60 border border-zinc-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Henüz duyuru paylaşılmadı.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementCard({ announcement, index }: { announcement: Announcement; index: number }) {
  return (
    <article
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 animate-scale-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
              Duyuru
            </span>
            <span className="flex items-center text-xs text-zinc-400">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(announcement.publish_at)}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-2">{announcement.title}</h2>
          {announcement.summary && <p className="text-zinc-300 mb-4">{announcement.summary}</p>}
          <div
            className="prose prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </div>
        <ArrowUpRight className="w-6 h-6 text-zinc-600" />
      </div>
    </article>
  );
}
