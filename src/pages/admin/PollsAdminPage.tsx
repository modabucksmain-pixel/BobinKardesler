import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BarChart3, Plus, Edit, Trash2, ArrowLeft, Users } from 'lucide-react';

interface Poll {
  id: string;
  question: string;
  description: string | null;
  status: 'active' | 'closed';
  end_date: string;
  created_at: string;
}

interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  position: number;
}

export function PollsAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadPolls();
    }
  }, [user, authLoading]);

  async function loadPolls() {
    setLoading(true);
    const { data } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPolls(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu anketi silmek istediğinizden emin misiniz?')) return;

    const { error } = await supabase.from('polls').delete().eq('id', id);

    if (!error) {
      loadPolls();
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await supabase
      .from('polls')
      .update({ status: newStatus })
      .eq('id', id);

    loadPolls();
  }

  async function getTotalVotes(pollId: string): Promise<number> {
    const { data } = await supabase
      .from('poll_options')
      .select('vote_count')
      .eq('poll_id', pollId);

    return data?.reduce((sum, opt) => sum + opt.vote_count, 0) || 0;
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-green-500 mb-2 glow-text">Anket Yönetimi</h1>
              <p className="text-zinc-400">Anketleri yönetin</p>
            </div>
            <button
              onClick={() => {
                setEditingPoll(null);
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Anket</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">Henüz anket yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onDelete={handleDelete}
                onToggleStatus={toggleStatus}
                onEdit={(p) => {
                  setEditingPoll(p);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PollModal
          poll={editingPoll}
          onClose={() => {
            setShowModal(false);
            setEditingPoll(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingPoll(null);
            loadPolls();
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}

function PollCard({
  poll,
  onDelete,
  onToggleStatus,
  onEdit,
}: {
  poll: Poll;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onEdit: (poll: Poll) => void;
}) {
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    loadVotes();
  }, []);

  async function loadVotes() {
    const { data } = await supabase
      .from('poll_options')
      .select('vote_count')
      .eq('poll_id', poll.id);

    const total = data?.reduce((sum, opt) => sum + opt.vote_count, 0) || 0;
    setTotalVotes(total);
  }

  const isExpired = new Date(poll.end_date) < new Date();

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-green-500/40 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-zinc-100">{poll.question}</h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                poll.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              {poll.status === 'active' ? 'Aktif' : 'Kapalı'}
            </span>
            {isExpired && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-500">
                Süresi Dolmuş
              </span>
            )}
          </div>
          {poll.description && (
            <p className="text-zinc-400 text-sm mb-3">{poll.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-zinc-400">
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{totalVotes} oy</span>
            </span>
            <span>Bitiş: {new Date(poll.end_date).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(poll.id, poll.status)}
            className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
            title={poll.status === 'active' ? 'Kapat' : 'Aktif Et'}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(poll)}
            className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
            title="Düzenle"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(poll.id)}
            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
            title="Sil"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PollModal({
  poll,
  onClose,
  onSaved,
  userId,
}: {
  poll: Poll | null;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
}) {
  const [question, setQuestion] = useState(poll?.question || '');
  const [description, setDescription] = useState(poll?.description || '');
  const [endDate, setEndDate] = useState(
    poll?.end_date ? new Date(poll.end_date).toISOString().split('T')[0] : ''
  );
  const [options, setOptions] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (poll) {
      loadOptions();
    }
  }, [poll]);

  async function loadOptions() {
    if (!poll) return;
    const { data } = await supabase
      .from('poll_options')
      .select('option_text')
      .eq('poll_id', poll.id)
      .order('position');

    if (data) {
      setOptions(data.map(o => o.option_text));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      alert('En az 2 seçenek girmelisiniz!');
      setLoading(false);
      return;
    }

    if (poll) {
      await supabase
        .from('polls')
        .update({
          question,
          description: description || null,
          end_date: new Date(endDate).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', poll.id);

      await supabase.from('poll_options').delete().eq('poll_id', poll.id);

      for (let i = 0; i < validOptions.length; i++) {
        await supabase.from('poll_options').insert({
          poll_id: poll.id,
          option_text: validOptions[i],
          position: i,
        });
      }
    } else {
      const { data: newPoll } = await supabase
        .from('polls')
        .insert({
          question,
          description: description || null,
          end_date: new Date(endDate).toISOString(),
          created_by: userId,
        })
        .select()
        .single();

      if (newPoll) {
        for (let i = 0; i < validOptions.length; i++) {
          await supabase.from('poll_options').insert({
            poll_id: newPoll.id,
            option_text: validOptions[i],
            position: i,
          });
        }
      }
    }

    setLoading(false);
    onSaved();
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-green-500/30 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-500 mb-6">
          {poll ? 'Anketi Düzenle' : 'Yeni Anket'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Soru</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Açıklama (İsteğe bağlı)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 resize-none"
            />
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

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Seçenekler</label>
            {options.map((option, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`Seçenek ${index + 1}`}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOptions([...options, ''])}
              className="w-full px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
            >
              + Seçenek Ekle
            </button>
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
