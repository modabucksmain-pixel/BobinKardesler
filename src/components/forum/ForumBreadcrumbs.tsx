import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
  onNavigate?: (href: string) => void;
}

export function ForumBreadcrumbs({ items, onNavigate }: Props) {
  return (
    <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300" aria-label="Forum breadcrumbs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const content = item.href && !isLast ? (
          <button
            type="button"
            onClick={() => item.href && onNavigate?.(item.href)}
            className="text-emerald-200 hover:text-emerald-100"
          >
            {item.label}
          </button>
        ) : (
          <span className="text-white font-semibold">{item.label}</span>
        );

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {content}
            {!isLast && <ChevronRight className="w-4 h-4 text-zinc-600" aria-hidden />}
          </div>
        );
      })}
    </nav>
  );
}

