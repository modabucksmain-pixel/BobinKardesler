import { MessageCircle, Timer, Lock } from 'lucide-react';
import type { ForumThread } from '../../lib/forum';
import { formatDate } from '../../lib/youtube';

interface Props {
  threads: ForumThread[];
  onSelect: (thread: ForumThread) => void;
  emptyLabel?: string;
}

export function ForumThreadList({ threads, onSelect, emptyLabel = 'Hiç konu yok' }: Props) {
  if (!threads.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-300">{emptyLabel}</div>
    );
  }

  return (
    <div className="divide-y divide-white/10">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelect(thread)}
          className="w-full text-left py-4 flex flex-col gap-1 transition hover:bg-white/5"
        >
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            {thread.category?.name && <span>{thread.category.name}</span>}
            {thread.forum?.name && (
              <>
                <span className="text-zinc-600">/</span>
                <span>{thread.forum.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {thread.is_locked && <Lock className="w-4 h-4 text-amber-300" />}
            <h3 className="text-lg font-semibold text-white line-clamp-2">{thread.title}</h3>
          </div>
          <p className="forum-muted text-sm line-clamp-2">{thread.body}</p>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {thread.reply_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer className="w-4 h-4" /> {formatDate(thread.created_at)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

