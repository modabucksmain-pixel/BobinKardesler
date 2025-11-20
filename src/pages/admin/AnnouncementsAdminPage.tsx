import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bell, Edit, Plus, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  publish_at: string;
  published: boolean;
  priority: number;
  created_at: string;
}

export function AnnouncementsAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { success, error: showError } = useNotification();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false })
      .order('publish_at', { ascending: false });

    if (error) {
      console.error('Failed to load announcements', error);
      showError('Duyurular yüklenemedi: ' + error.message);
      setAnnouncements([]);
    } else if (data) {
      setAnnouncements(data);
    }

    setLoading(false);
  }, [showError]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadAnnouncements();
    }
  }, [user, authLoading, loadAnnouncements]);

  async function handleDelete(id: string) {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('announcements').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete announcement', error);
      showError('Duyuru silinemedi: ' + error.message);
      return;
    }

    success('Duyuru silindi');
    loadAnnouncements();
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('announcements')
      .update({ published: !currentStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Failed to toggle publish status', error);
      showError('Yayın durumu değiştirilemedi: ' + error.message);
      return;
    }

    success(currentStatus ? 'Duyuru yayından kaldırıldı' : 'Duyuru yayına alındı');
    loadAnnouncements();
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a
            href="/admin"
            className="inline-flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard'a Dön</span>
          </a>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-green-500 mb-2 glow-text">Site Duyuruları</h1>
              <p className="text-zinc-400">Ana sayfada gözüken duyuruları yönetin</p>
            </div>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Duyuru</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Bell className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">Henüz duyuru yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-green-500/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-zinc-100">{announcement.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          announcement.published ? 'bg-green-500/10 text-green-500' : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {announcement.published ? 'Yayında' : 'Taslak'}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/10 text-blue-400">
                        Öncelik: {announcement.priority}
                      </span>
                    </div>
                    {announcement.summary && (
                      <p className="text-zinc-400 text-sm mb-2">{announcement.summary}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Yayın: {new Date(announcement.publish_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePublished(announcement.id, announcement.published)}
                      className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                      title={announcement.published ? 'Yayından Kaldır' : 'Yayınla'}
                    >
                      {announcement.published ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAnnouncement(announcement);
                        setShowModal(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AnnouncementModal
          announcement={editingAnnouncement}
          onClose={() => {
            setShowModal(false);
            setEditingAnnouncement(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingAnnouncement(null);
            loadAnnouncements();
          }}
        />
      )}
    </div>
  );
}

function AnnouncementModal({
  announcement,
  onClose,
  onSaved,
}: {
  announcement: Announcement | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(announcement?.title || '');
  const [summary, setSummary] = useState(announcement?.summary || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [publishAt, setPublishAt] = useState(() => {
    if (announcement) return announcement.publish_at.slice(0, 16);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [priority, setPriority] = useState(announcement?.priority ?? 0);
  const [published, setPublished] = useState(announcement?.published ?? false);
  const [contentType, setContentType] = useState<'text' | 'html'>(announcement ? 'html' : 'text');
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useNotification();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!title.trim()) {
      showError('Başlık gereklidir');
      setLoading(false);
      return;
    }

    const publishDate = new Date(publishAt);
    if (Number.isNaN(publishDate.getTime())) {
      showError('Geçerli bir yayın tarihi seçin');
      setLoading(false);
      return;
    }

    const finalContent =
      contentType === 'text'
        ? `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
        : content;

    const payload = {
      title: title.trim(),
      summary: summary.trim() ? summary.trim() : null,
      content: finalContent,
      publish_at: publishDate.toISOString(),
      priority,
      published,
    };

    const response = announcement
      ? await supabase
          .from('announcements')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', announcement.id)
      : await supabase.from('announcements').insert(payload);

    if (response.error) {
      console.error('Failed to save announcement', response.error);
      showError('Duyuru kaydedilemedi: ' + response.error.message);
      setLoading(false);
      return;
    }

    success(announcement ? 'Duyuru güncellendi' : 'Yeni duyuru oluşturuldu');
    setLoading(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-green-500/30 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-500 mb-6">
          {announcement ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Özet (isteğe bağlı)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 text-sm resize-none"
              placeholder="Kısa özet metni"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-300">İçerik</label>
              <div className="flex items-center space-x-3 text-sm">
                <button
                  type="button"
                  onClick={() => setContentType('text')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    contentType === 'text'
                      ? 'bg-green-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  Düz Metin
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('html')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    contentType === 'html'
                      ? 'bg-green-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  HTML
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mb-2">
              {contentType === 'text'
                ? 'Düz metin olarak yazın. Paragraflar otomatik formatlanacak.'
                : 'HTML etiketleri kullanarak yazın (örn: <p>, <strong>, <a>).'}
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              className={`w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 text-sm resize-none ${
                contentType === 'html' ? 'font-mono' : ''
              }`}
              placeholder={contentType === 'text' ? 'Duyuru içeriğinizi buraya yazın...' : '<p>HTML içeriğinizi buraya yazın...</p>'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Yayın Tarihi</label>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Öncelik</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
            </div>
            <div className="flex items-center space-x-3 pt-6">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 text-green-500 bg-zinc-800 border-zinc-700 rounded"
              />
              <label htmlFor="published" className="text-zinc-300 text-sm">
                Yayına al
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
