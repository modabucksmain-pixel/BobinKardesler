import { BadgeCheck, Heart, Quote } from 'lucide-react';
import type { ForumReply } from '../../lib/forum';
import { formatDate } from '../../lib/youtube';

interface Props {
  reply: ForumReply;
  onQuote?: (reply: ForumReply) => void;
  onLike?: (reply: ForumReply) => void;
  likes?: number;
}

export function ForumPostCard({ reply, onQuote, onLike, likes = 0 }: Props) {
  return (
    <article className="border border-white/10 rounded-2xl bg-white/5 p-4 sm:p-5 flex gap-4 shadow-sm">
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{reply.author_email || 'Anonim kullanıcı'}</span>
            {reply.is_solution && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200 border border-emerald-400/50">
                <BadgeCheck className="w-4 h-4" /> Çözüm
              </span>
            )}
          </div>
          <span className="text-zinc-400">{formatDate(reply.created_at)}</span>
        </div>
        <p className="text-zinc-100 whitespace-pre-line leading-relaxed">{reply.body}</p>
        <div className="flex items-center gap-3 text-sm text-zinc-200">
          <button
            type="button"
            onClick={() => onLike?.(reply)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:border-emerald-300/60 hover:text-emerald-100"
          >
            <Heart className="w-4 h-4" /> {likes}
          </button>
          {onQuote && (
            <button
              type="button"
              onClick={() => onQuote(reply)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:border-emerald-300/60 hover:text-emerald-100"
            >
              <Quote className="w-4 h-4" /> Alıntıla
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

