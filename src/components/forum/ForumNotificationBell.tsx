import { Bell, BellRing } from 'lucide-react';

interface Props {
  hasUnread?: boolean;
  onClick?: () => void;
}

export function ForumNotificationBell({ hasUnread, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 text-white transition hover:border-emerald-300/60"
      aria-label="Forum bildirimleri"
    >
      {hasUnread ? <BellRing className="w-5 h-5 text-emerald-300" /> : <Bell className="w-5 h-5" />}
      {hasUnread && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />}
    </button>
  );
}

