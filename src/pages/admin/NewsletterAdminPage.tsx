import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSubscribers, type NewsletterSubscriber } from '../../lib/newsletter';
import { Mail, ArrowLeft, Download, Users, Copy, Send } from 'lucide-react';

export function NewsletterAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
      return;
    }
    if (!authLoading && user) {
      loadSubscribers();
    }
  }, [user, authLoading]);

  async function loadSubscribers() {
    setLoading(true);
    const data = await getAllSubscribers();
    setSubscribers(data);
    setLoading(false);
  }

  const subscriberEmails = subscribers.map(sub => sub.email).join(', ');

  async function copyEmails() {
    if (!subscriberEmails) return;

    try {
      await navigator.clipboard.writeText(subscriberEmails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy emails', error);
      setCopied(false);
    }
  }

  function exportToCSV() {
    const headers = ['E-posta', 'İsim', 'Abone Olma Tarihi'];
    const rows = subscribers.map(sub => [
      sub.email,
      sub.name || '',
      new Date(sub.subscribed_at).toLocaleDateString('tr-TR'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bulten-aboneleri-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
              <h1 className="text-4xl font-bold text-green-500 mb-2 glow-text">Bülten Aboneleri</h1>
              <p className="text-zinc-400">E-posta abonelerini görüntüle</p>
            </div>
            {subscribers.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
              >
                <Download className="w-5 h-5" />
                <span>CSV İndir</span>
              </button>
            )}
          </div>
        </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <Users className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-zinc-100">{subscribers.length}</p>
                  <p className="text-zinc-400">Toplam Abone</p>
                </div>
              </div>

              {subscribers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
                  <button
                    onClick={copyEmails}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/30 px-4 py-2 text-sm font-semibold text-green-200 hover:bg-green-500/10 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Kopyalandı' : 'Adresleri Kopyala'}
                  </button>
                  <a
                    href={`mailto:?bcc=${encodeURIComponent(subscriberEmails)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Toplu Mail Başlat
                  </a>
                </div>
              )}
            </div>
          </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-4 h-20"></div>
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Mail className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg mb-4">Henüz abone yok</p>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800/50 border-b border-zinc-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                      E-posta
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                      İsim
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                      Abone Olma Tarihi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber.id}
                      className={`border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors ${
                        index % 2 === 0 ? 'bg-zinc-900/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-zinc-100">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-green-500" />
                          <span>{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {subscriber.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {new Date(subscriber.subscribed_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
