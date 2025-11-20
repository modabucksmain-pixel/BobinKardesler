import { useEffect, useState } from 'react';
import { BarChart3, Check, Clock } from 'lucide-react';
import { getActivePolls, voteOnPoll, hasUserVoted, type PollWithOptions } from '../lib/polls';
import { formatDate } from '../lib/youtube';

export function PollsPage() {
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPolls();
    loadVotedPolls();
  }, []);

  async function loadPolls() {
    setLoading(true);
    const data = await getActivePolls();
    setPolls(data);
    setLoading(false);
  }

  async function loadVotedPolls() {
    const userIp = await getUserIP();
    const voted = new Set<string>();

    for (const poll of polls) {
      const hasVoted = await hasUserVoted(poll.id, userIp);
      if (hasVoted) {
        voted.add(poll.id);
      }
    }

    setVotedPolls(voted);
  }

  async function getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  async function handleVote(pollId: string, optionId: string) {
    const userIp = await getUserIP();
    const result = await voteOnPoll(pollId, optionId, userIp);

    if (result.success) {
      setVotedPolls(prev => new Set([...prev, pollId]));
      loadPolls();
    } else {
      alert(result.error || 'Oy kullanırken bir hata oluştu.');
    }
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-block p-3 sm:p-4 bg-green-500/10 rounded-full mb-4 sm:mb-6">
            <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-500 mb-3 sm:mb-4 glow-text px-2">
            Topluluk Anketleri
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Görüşlerinizi paylaşın ve topluluğun fikrini öğrenin
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900/50 rounded-lg p-6 h-64"></div>
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <BarChart3 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Aktif anket bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll, index) => (
              <PollCard
                key={poll.id}
                poll={poll}
                index={index}
                hasVoted={votedPolls.has(poll.id)}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PollCard({
  poll,
  index,
  hasVoted,
  onVote,
}: {
  poll: PollWithOptions;
  index: number;
  hasVoted: boolean;
  onVote: (pollId: string, optionId: string) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const getPercentage = (voteCount: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((voteCount / poll.total_votes) * 100);
  };

  const isExpired = new Date(poll.end_date) < new Date();

  return (
    <div
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 sm:p-6 hover:border-green-500/40 transition-all duration-300 animate-scale-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex-1">{poll.question}</h2>
        {isExpired && (
          <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-semibold whitespace-nowrap">
            Sona Erdi
          </span>
        )}
      </div>

      {poll.description && (
        <p className="text-zinc-400 text-sm sm:text-base mb-4 sm:mb-6">{poll.description}</p>
      )}

      <div className="space-y-3 mb-6">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.vote_count);
          const isSelected = selectedOption === option.id;

          if (hasVoted || isExpired) {
            return (
              <div key={option.id} className="relative">
                <div className="relative z-10 px-4 py-3 rounded-lg border border-zinc-700 flex items-center justify-between">
                  <span className="text-zinc-100 font-medium">{option.option_text}</span>
                  <span className="text-green-500 font-bold">{percentage}%</span>
                </div>
                <div
                  className="absolute inset-0 bg-green-500/20 rounded-lg transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            );
          }

          return (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full px-4 py-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-500/10 text-green-500'
                  : 'border-zinc-700 hover:border-zinc-600 text-zinc-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-zinc-950" />}
                </div>
                <span className="font-medium">{option.option_text}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs sm:text-sm text-zinc-500 gap-3">
        <div className="flex items-center flex-wrap gap-3 sm:gap-4">
          <span className="flex items-center space-x-1">
            <BarChart3 className="w-4 h-4" />
            <span>{poll.total_votes} oy</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Bitiş: {formatDate(poll.end_date)}</span>
            <span className="sm:hidden">{formatDate(poll.end_date)}</span>
          </span>
        </div>

        {!hasVoted && !isExpired && (
          <button
            onClick={() => selectedOption && onVote(poll.id, selectedOption)}
            disabled={!selectedOption}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Oy Ver
          </button>
        )}
      </div>
    </div>
  );
}
