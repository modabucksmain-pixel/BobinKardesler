import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, RefreshCw } from 'lucide-react';

export function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadSettings();
    }
  }, [user, authLoading]);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['youtube_api_key', 'youtube_channel_id']);

    if (data) {
      data.forEach((setting) => {
        const value = setting.value as any;
        if (setting.key === 'youtube_api_key' && value?.api_key) {
          setYoutubeApiKey(value.api_key);
        }
        if (setting.key === 'youtube_channel_id' && value?.channel_id) {
          setYoutubeChannelId(value.channel_id);
        }
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    await Promise.all([
      supabase
        .from('site_settings')
        .upsert(
          {
            key: 'youtube_api_key',
            value: { api_key: youtubeApiKey },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        ),
      supabase
        .from('site_settings')
        .upsert(
          {
            key: 'youtube_channel_id',
            value: { channel_id: youtubeChannelId },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        ),
    ]);

    alert('Ayarlar kaydedildi!');
    setSaving(false);
  }

  async function handleClearCache() {
    if (!confirm('YouTube önbelleğini temizlemek istediğinizden emin misiniz?')) return;

    await supabase.from('youtube_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    alert('Önbellek temizlendi! Veriler yeniden yüklenecek.');
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
            <div className="h-12 bg-zinc-800 rounded"></div>
            <div className="h-12 bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a
            href="/admin"
            className="inline-flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard'a Dön</span>
          </a>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-green-500 mb-2 glow-text">Site Ayarları</h1>
              <p className="text-zinc-400">YouTube API ve diğer site ayarları</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-4">YouTube API Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  YouTube API Anahtarı
                </label>
                <input
                  type="text"
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
                  placeholder="AIzaSy..."
                />
                <p className="text-xs text-zinc-500 mt-2">
                  YouTube Data API v3 anahtarınızı{' '}
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:underline"
                  >
                    Google Cloud Console
                  </a>
                  'dan alabilirsiniz.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  YouTube Kanal ID
                </label>
                <input
                  type="text"
                  value={youtubeChannelId}
                  onChange={(e) => setYoutubeChannelId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
                  placeholder="UC..."
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Kanal ID'nizi YouTube kanalınızın URL'sinden veya ayarlarından bulabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-4">Önbellek Yönetimi</h2>
            <p className="text-zinc-400 text-sm mb-4">
              YouTube verilerini daha hızlı yüklemek için önbelleğe alıyoruz. Önbelleği
              temizleyerek verileri yeniden yükleyebilirsiniz.
            </p>
            <button
              onClick={handleClearCache}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Önbelleği Temizle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
