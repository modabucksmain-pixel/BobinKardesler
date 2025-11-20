import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getAllGiveaways, getGiveawayParticipants, selectRandomWinner, type Giveaway, type GiveawayParticipant } from '../../lib/giveaways';
import { Gift, Plus, Users, Trophy, Calendar, Trash2, Eye } from 'lucide-react';

export function GiveawaysAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);
  const [participants, setParticipants] = useState<GiveawayParticipant[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadGiveaways();
    }
  }, [user, authLoading]);

  async function loadGiveaways() {
    setLoading(true);
    const data = await getAllGiveaways();
    setGiveaways(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu çekilişi silmek istediğinize emin misiniz?')) return;

    const { error } = await supabase.from('giveaways').delete().eq('id', id);

    if (!error) {
      loadGiveaways();
    } else {
      alert('Hata: ' + error.message);
    }
  }

  async function handleSelectWinner(giveaway: Giveaway) {
    if (!confirm('Rastgele kazanan seçilsin mi?')) return;

    const result = await selectRandomWinner(giveaway.id);

    if (result.success && result.winner) {
      alert(`Kazanan: ${result.winner.name} (${result.winner.email})`);
      loadGiveaways();
    } else {
      alert(result.error || 'Bir hata oluştu!');
    }
  }

  async function handleViewParticipants(giveaway: Giveaway) {
    setSelectedGiveaway(giveaway);
    const data = await getGiveawayParticipants(giveaway.id);
    setParticipants(data);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-green-500 glow-text">Çekiliş Yönetimi</h1>
            <p className="text-zinc-400 mt-2">Çekilişleri oluştur ve yönet</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Çekiliş</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        ) : giveaways.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Gift className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">Henüz çekiliş oluşturulmamış.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {giveaways.map((giveaway) => (
              <GiveawayAdminCard
                key={giveaway.id}
                giveaway={giveaway}
                onDelete={handleDelete}
                onSelectWinner={handleSelectWinner}
                onViewParticipants={handleViewParticipants}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGiveawayModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadGiveaways();
          }}
          userId={user.id}
        />
      )}

      {selectedGiveaway && (
        <ParticipantsModal
          giveaway={selectedGiveaway}
          participants={participants}
          onClose={() => {
            setSelectedGiveaway(null);
            setParticipants([]);
          }}
        />
      )}
    </div>
  );
}

function GiveawayAdminCard({
  giveaway,
  onDelete,
  onSelectWinner,
  onViewParticipants,
}: {
  giveaway: Giveaway;
  onDelete: (id: string) => void;
  onSelectWinner: (giveaway: Giveaway) => void;
  onViewParticipants: (giveaway: Giveaway) => void;
}) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-500',
    completed: 'bg-blue-500/20 text-blue-500',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  const statusLabels = {
    active: 'Aktif',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 md:p-6 hover:border-green-500/30 transition-all duration-300 animate-scale-in">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className="text-lg md:text-xl font-bold text-zinc-100">{giveaway.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[giveaway.status]}`}>
              {statusLabels[giveaway.status]}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-4">{giveaway.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-zinc-400">
              <Calendar className="w-4 h-4 text-green-500" />
              <span>Bitiş: {new Date(giveaway.end_date).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center space-x-2 text-zinc-400">
              <Users className="w-4 h-4 text-green-500" />
              <span>{giveaway.participant_count || 0} katılımcı</span>
            </div>
            {giveaway.winner_name && (
              <div className="flex items-center space-x-2 text-zinc-400">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Kazanan: {giveaway.winner_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-2">
          <button
            onClick={() => onViewParticipants(giveaway)}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors text-sm flex-1 md:flex-none"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Katılımcılar</span>
          </button>
          {giveaway.status === 'active' && (
            <button
              onClick={() => onSelectWinner(giveaway)}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-colors text-sm flex-1 md:flex-none"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Kazanan Seç</span>
            </button>
          )}
          <button
            onClick={() => onDelete(giveaway.id)}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm flex-1 md:flex-none"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateGiveawayModal({ onClose, onCreated, userId }: { onClose: () => void; onCreated: () => void; userId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('giveaways').insert({
      title,
      description,
      prize,
      image_url: imageUrl || null,
      start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      end_date: new Date(endDate).toISOString(),
      status: 'active',
      created_by: userId,
    });

    if (!error) {
      onCreated();
    } else {
      alert('Hata: ' + error.message);
    }

    setLoading(false);
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-green-500/30 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-500 mb-6">Yeni Çekiliş Oluştur</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              placeholder="Örn: iPhone 15 Çekilişi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 resize-none"
              placeholder="Çekiliş detayları..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Ödül</label>
            <input
              type="text"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              placeholder="Örn: iPhone 15 Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Görsel URL (İsteğe bağlı)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Başlangıç Tarihi</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={minDate}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
              <p className="text-xs text-zinc-500 mt-1">Boş bırakılırsa şimdi başlar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Bitiş Tarihi</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={minDate}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
              />
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
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ParticipantsModal({
  giveaway,
  participants,
  onClose,
}: {
  giveaway: Giveaway;
  participants: GiveawayParticipant[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-green-500/30 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-green-500">{giveaway.title}</h2>
            <p className="text-zinc-400 text-sm mt-1">{participants.length} katılımcı</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Kapat
          </button>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">Henüz katılımcı yok.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-zinc-500 font-mono text-sm">{index + 1}</span>
                  <div>
                    <p className="text-zinc-100 font-semibold">{participant.name}</p>
                    <p className="text-zinc-400 text-sm">{participant.email}</p>
                  </div>
                </div>
                <span className="text-zinc-500 text-xs">
                  {new Date(participant.participated_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
