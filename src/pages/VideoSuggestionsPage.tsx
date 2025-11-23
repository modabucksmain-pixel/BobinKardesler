import { useCallback, useEffect, useState } from 'react';
import { Lightbulb, ThumbsUp, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';

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
  const { error: showError, success: pushSuccess } = useNotification();
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submitter_name: '',
  });

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('video_suggestions')
        .select('id, title, description, submitter_name, status, votes, created_at')
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw Object.assign(error, { code: 'VS-LOAD-01' });
      }

      setSuggestions(data ?? []);
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined;
      const message = 'Öneriler yüklenirken bir sorun oluştu. Lütfen yeniden deneyin.';
      const errorCode = code || 'VS-LOAD-UNKNOWN';
      setErrorMessage(`${message} (Hata kodu: ${errorCode})`);
      showError(`${message} (Hata kodu: ${errorCode})`);
      console.error('Video suggestions load error', err);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      const code = 'VS-VALIDATION-01';
      const message = 'Lütfen zorunlu alanları doldurun.';
      setErrorMessage(`${message} (Hata kodu: ${code})`);
      showError(`${message} (Hata kodu: ${code})`);
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('video_suggestions').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        submitter_name: formData.submitter_name.trim() || null,
      });

      if (error) {
        throw Object.assign(error, { code: 'VS-SUBMIT-01' });
      }

      setFormData({ title: '', description: '', submitter_name: '' });
      setShowSuccessBanner(true);
      pushSuccess('Fikriniz başarıyla gönderildi!');
      setTimeout(() => setShowSuccessBanner(false), 5000);
      loadSuggestions();
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined;
      const message = 'Fikriniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
      const errorCode = code || 'VS-SUBMIT-UNKNOWN';
      setErrorMessage(`${message} (Hata kodu: ${errorCode})`);
      showError(`${message} (Hata kodu: ${errorCode})`);
      console.error('Video suggestion submit error', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(suggestionId: string, currentVotes: number) {
    const votedKey = `voted_${suggestionId}`;

    try {
      if (localStorage.getItem(votedKey)) {
        return;
      }

      const { error } = await supabase
        .from('video_suggestions')
        .update({ votes: currentVotes + 1 })
        .eq('id', suggestionId);

      if (error) {
        throw Object.assign(error, { code: 'VS-VOTE-01' });
      }

      localStorage.setItem(votedKey, 'true');
      loadSuggestions();
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined;
      const message = 'Oy verilirken bir hata oluştu. Lütfen tekrar deneyin.';
      const errorCode = code || 'VS-VOTE-UNKNOWN';
      setErrorMessage(`${message} (Hata kodu: ${errorCode})`);
      showError(`${message} (Hata kodu: ${errorCode})`);
      console.error('Video suggestion vote error', err);
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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

        {errorMessage && (
          <div
            className="flex items-start space-x-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {showSuccessBanner && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-3 animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className="text-green-400 font-medium">
              Fikriniz başarıyla gönderildi! Teşekkür ederiz.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">Yeni Fikir Gönder</h2>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Temel bilgileri doldurun, geri kalanını biz hallederiz.
                </p>
              </div>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">Adım 1</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <h2 className="text-2xl font-bold text-zinc-100">Nasıl Çalışır?</h2>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">Hızlı rehber</span>
            </div>
            <div className="space-y-6 divide-y divide-zinc-800">
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-1">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 font-bold">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-zinc-100">Fikrinizi Paylaşın</h3>
                  <p className="text-zinc-400 text-sm">
                    Başlığı ve kısa açıklamayı yazın, ister isminizi ekleyin ister anonim kalın.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 font-bold">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-zinc-100">Topluluk Oylasın</h3>
                  <p className="text-zinc-400 text-sm">
                    Oy butonuna tek dokunuşla destek verin. Her cihazdan yalnızca bir oy kaydedilir.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 font-bold">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-zinc-100">Video Yapılsın</h3>
                  <p className="text-zinc-400 text-sm">
                    En çok oy alan fikirler önce çekim planına eklenir. Sonuçları burada takip edin.
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
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-semibold text-zinc-100 leading-snug">
                        {suggestion.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{suggestion.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        {suggestion.submitter_name && (
                          <span className="rounded-full bg-zinc-800 px-2 py-1">
                            Öneren: {suggestion.submitter_name}
                          </span>
                        )}
                        <span className="rounded-full bg-zinc-800 px-2 py-1">
                          {new Date(suggestion.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div className="sm:ml-4">{getStatusBadge(suggestion.status)}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
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
