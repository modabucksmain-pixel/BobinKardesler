import { useEffect, useState } from 'react';
import { Lightbulb, ThumbsUp, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VideoSuggestion {
  id: string;
  title: string;
  description: string;
  submitter_name: string | null;
  status: string;
  votes: number;
  created_at: string;
}

export function VideoSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submitter_name: '',
  });

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('video_suggestions')
      .select('id, title, description, submitter_name, status, votes, created_at')
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSuggestions(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('video_suggestions').insert({
      title: formData.title.trim(),
      description: formData.description.trim(),
      submitter_name: formData.submitter_name.trim() || null,
    });

    setSubmitting(false);

    if (!error) {
      setFormData({ title: '', description: '', submitter_name: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      loadSuggestions();
    }
  }

  async function handleVote(suggestionId: string, currentVotes: number) {
    const votedKey = `voted_${suggestionId}`;
    if (localStorage.getItem(votedKey)) {
      return;
    }

    await supabase
      .from('video_suggestions')
      .update({ votes: currentVotes + 1 })
      .eq('id', suggestionId);

    localStorage.setItem(votedKey, 'true');
    loadSuggestions();
  }

  function hasVoted(suggestionId: string): boolean {
    return localStorage.getItem(`voted_${suggestionId}`) !== null;
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

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-6">
            <Lightbulb className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            Video Fikri Öner
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Görmek istediğiniz elektrik ve teknoloji projelerini bizimle paylaşın.
            En çok oy alan fikirler öncelikli olarak değerlendirilir.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-3 animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className="text-green-400 font-medium">
              Fikriniz başarıyla gönderildi! Teşekkür ederiz.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">Yeni Fikir Gönder</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
                  Video Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                  required
                  placeholder="Örn: Tesla Bobini Yapımı"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                />
                <p className="text-xs text-zinc-500 mt-1">{formData.title.length}/100</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                  Açıklama *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                  required
                  rows={5}
                  placeholder="Projenin detaylarını, ne görmek istediğinizi anlatın..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
                <p className="text-xs text-zinc-500 mt-1">{formData.description.length}/500</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                  İsminiz (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.submitter_name}
                  onChange={(e) => setFormData({ ...formData, submitter_name: e.target.value })}
                  maxLength={50}
                  placeholder="Anonim"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-zinc-950 font-bold rounded-lg hover:bg-green-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{submitting ? 'Gönderiliyor...' : 'Fikri Gönder'}</span>
              </button>
            </form>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">Nasıl Çalışır?</h2>
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">Fikrinizi Paylaşın</h3>
                  <p className="text-zinc-400 text-sm">
                    Görmek istediğiniz projeyi detaylı bir şekilde anlatın.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">Topluluk Oylasın</h3>
                  <p className="text-zinc-400 text-sm">
                    Diğer izleyiciler beğendikleri fikirlere oy verebilir.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">Video Yapılsın</h3>
                  <p className="text-zinc-400 text-sm">
                    En çok oy alan fikirler video olarak hazırlanır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-8">Önerilen Fikirler</h2>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-40"></div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 rounded-lg border border-zinc-800">
              <Lightbulb className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">Henüz fikir önerisi yok. İlk öneren siz olun!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-green-500/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                        {suggestion.title}
                      </h3>
                      <p className="text-zinc-400 text-sm mb-3">{suggestion.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-zinc-500">
                        {suggestion.submitter_name && (
                          <span>Öneren: {suggestion.submitter_name}</span>
                        )}
                        <span>{new Date(suggestion.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <div className="ml-4">{getStatusBadge(suggestion.status)}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote(suggestion.id, suggestion.votes)}
                      disabled={hasVoted(suggestion.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        hasVoted(suggestion.id)
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-semibold">{suggestion.votes}</span>
                      <span className="text-sm">{hasVoted(suggestion.id) ? 'Oylandı' : 'Oy Ver'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
