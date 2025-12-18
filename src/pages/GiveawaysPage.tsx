import { useEffect, useState } from 'react';
import { Gift, Calendar, Users, CheckCircle, Mail, User } from 'lucide-react';
import { getActiveGiveaways, participateInGiveaway, type Giveaway } from '../lib/giveaways';

export function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGiveaways();
  }, []);

  async function loadGiveaways() {
    setLoading(true);
    const data = await getActiveGiveaways();
    setGiveaways(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6 animate-pulse-glow">
            <Gift className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-green-500 mb-4 glow-text">
            Çekilişler
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Bobin Kardeşler topluluğu için düzenlenen çekilişlere katıl, harika ödüller kazan!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-zinc-800 h-64 rounded-lg mb-4"></div>
                <div className="h-6 bg-zinc-800 rounded mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : giveaways.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-20 h-20 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Şu an aktif çekiliş bulunmuyor.</p>
            <p className="text-zinc-500 text-sm mt-2">Yeni çekilişler için takipte kalın!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giveaways.map((giveaway, index) => (
              <GiveawayCard key={giveaway.id} giveaway={giveaway} index={index} onParticipated={loadGiveaways} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GiveawayCard({ giveaway, index, onParticipated }: { giveaway: Giveaway; index: number; onParticipated: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const endDate = new Date(giveaway.end_date);
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await participateInGiveaway(giveaway.id, name, email);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setName('');
        setEmail('');
        onParticipated();
      }, 2000);
    } else {
      setError(result.error || 'Bir hata oluştu!');
    }

    setLoading(false);
  }

  return (
    <>
      <div
        className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 animate-scale-in group"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {giveaway.image_url && (
          <div className="aspect-video overflow-hidden bg-zinc-800">
            <img
              src={giveaway.image_url}
              alt={giveaway.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}

        <div className="p-6">
          <h3 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-green-500 transition-colors">
            {giveaway.title}
          </h3>
          <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{giveaway.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-zinc-400">
              <Calendar className="w-4 h-4 text-green-500" />
              <span>
                {daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Bugün bitiyor'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-zinc-400">
              <Users className="w-4 h-4 text-green-500" />
              <span>{giveaway.participant_count || 0} katılımcı</span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-all duration-300 font-bold group-hover:scale-105"
          >
            <Gift className="w-5 h-5" />
            <span>Çekilişe Katıl</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-green-500/30 rounded-lg max-w-md w-full p-6 animate-scale-in">
            {success ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-500 mb-2">Başarılı!</h3>
                <p className="text-zinc-400">Çekilişe katıldınız. Bol şans!</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <Gift className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-zinc-100 mb-2">{giveaway.title}</h3>
                  <p className="text-zinc-400 text-sm">Çekilişe katılmak için bilgilerinizi girin</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      İsim Soyisim
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50"
                    >
                      {loading ? 'Katılıyor...' : 'Katıl'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
