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
    <article className="border border-slate-200 rounded-xl bg-white p-4 flex gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{reply.author_email || 'Anonim kullanıcı'}</span>
            {reply.is_solution && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                <BadgeCheck className="w-4 h-4" /> Çözüm
              </span>
            )}
          </div>
          <span>{formatDate(reply.created_at)}</span>
        </div>
        <p className="text-slate-800 whitespace-pre-line">{reply.body}</p>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => onLike?.(reply)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 hover:border-emerald-300 hover:text-emerald-700"
          >
            <Heart className="w-4 h-4" /> {likes}
          </button>
          {onQuote && (
            <button
              type="button"
              onClick={() => onQuote(reply)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 hover:border-emerald-300 hover:text-emerald-700"
            >
              <Quote className="w-4 h-4" /> Alıntıla
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

