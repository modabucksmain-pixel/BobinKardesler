import { useEffect, useState } from 'react';
import { Lightbulb, ThumbsUp, Check, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface VideoSuggestion {
  id: string;
  title: string;
  description: string;
  submitter_name: string | null;
  submitter_email: string | null;
  status: string;
  votes: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function VideoSuggestionsAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadSuggestions();
    }
  }, [user, authLoading]);

  async function loadSuggestions() {
    setLoading(true);
    const query = supabase
      .from('video_suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query.eq('status', filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setSuggestions(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [filter, user]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('video_suggestions')
      .update({ status })
      .eq('id', id);

    if (!error) {
      loadSuggestions();
    }
  }

  async function deleteSuggestion(id: string) {
    if (!confirm('Bu öneriyi silmek istediğinize emin misiniz?')) {
      return;
    }

    const { error } = await supabase
      .from('video_suggestions')
      .delete()
      .eq('id', id);

    if (!error) {
      loadSuggestions();
    }
  }

  async function saveNotes(id: string) {
    const { error } = await supabase
      .from('video_suggestions')
      .update({ admin_notes: editNotes })
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      setEditNotes('');
      loadSuggestions();
    }
  }

  function startEditNotes(suggestion: VideoSuggestion) {
    setEditingId(suggestion.id);
    setEditNotes(suggestion.admin_notes || '');
  }

  function getStatusBadge(status: string) {
    const badges: Record<string, { text: string; className: string }> = {
      pending: { text: 'İnceleniyor', className: 'bg-zinc-700 text-zinc-300' },
      approved: { text: 'Onaylandı', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
      completed: { text: 'Tamamlandı', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
      rejected: { text: 'Reddedildi', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
        {badge.text}
      </span>
    );
  }

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter(s => s.status === 'pending').length,
    approved: suggestions.filter(s => s.status === 'approved').length,
    completed: suggestions.filter(s => s.status === 'completed').length,
    rejected: suggestions.filter(s => s.status === 'rejected').length,
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Video Önerileri Yönetimi</h1>
          <p className="text-zinc-400">Kullanıcı önerilerini inceleyin ve yönetin</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`p-4 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-green-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm">Toplam</div>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`p-4 rounded-lg transition-all ${
              filter === 'pending'
                ? 'bg-green-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm">İnceleniyor</div>
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`p-4 rounded-lg transition-all ${
              filter === 'approved'
                ? 'bg-green-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="text-2xl font-bold">{stats.approved}</div>
            <div className="text-sm">Onaylı</div>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`p-4 rounded-lg transition-all ${
              filter === 'completed'
                ? 'bg-green-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm">Tamamlandı</div>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`p-4 rounded-lg transition-all ${
              filter === 'rejected'
                ? 'bg-green-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <div className="text-sm">Reddedildi</div>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-48"></div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <Lightbulb className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Henüz öneri yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-zinc-100">
                        {suggestion.title}
                      </h3>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <p className="text-zinc-400 mb-4">{suggestion.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-zinc-500">
                      {suggestion.submitter_name && (
                        <span>Öneren: {suggestion.submitter_name}</span>
                      )}
                      {suggestion.submitter_email && (
                        <span>Email: {suggestion.submitter_email}</span>
                      )}
                      <span className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{suggestion.votes} oy</span>
                      </span>
                      <span>{new Date(suggestion.created_at).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                {editingId === suggestion.id ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Admin Notları
                    </label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => saveNotes(suggestion.id)}
                        className="px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-medium"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditNotes('');
                        }}
                        className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : suggestion.admin_notes ? (
                  <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-400 mb-1">Admin Notları</p>
                        <p className="text-zinc-300">{suggestion.admin_notes}</p>
                      </div>
                      <button
                        onClick={() => startEditNotes(suggestion)}
                        className="text-zinc-400 hover:text-green-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditNotes(suggestion)}
                    className="mb-4 text-sm text-zinc-500 hover:text-green-500 transition-colors flex items-center space-x-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Not ekle</span>
                  </button>
                )}

                <div className="flex items-center space-x-3">
                  {suggestion.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(suggestion.id, 'approved')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Onayla</span>
                    </button>
                  )}
                  {suggestion.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(suggestion.id, 'completed')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Tamamlandı</span>
                    </button>
                  )}
                  {suggestion.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(suggestion.id, 'rejected')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reddet</span>
                    </button>
                  )}
                  {suggestion.status !== 'pending' && (
                    <button
                      onClick={() => updateStatus(suggestion.id, 'pending')}
                      className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                    >
                      İncelemeye Al
                    </button>
                  )}
                  <button
                    onClick={() => deleteSuggestion(suggestion.id)}
                    className="ml-auto flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
