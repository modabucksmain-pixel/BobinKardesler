import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Action {
  label: string;
  href: string;
}

interface PageLayoutProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: Action[];
  backHref?: string;
  children: ReactNode;
}

export function PageLayout({ title, description, eyebrow, actions, backHref, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-grid pb-20 pt-24">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            {backHref && (
              <a
                href={backHref}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-zinc-200 transition hover:text-green-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri Dön
              </a>
            )}
            {eyebrow && (
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-green-400">
                {eyebrow}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                {title}
              </h1>
              {description && <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">{description}</p>}
            </div>
            {actions && actions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {actions.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className="inline-flex items-center justify-center rounded-xl border border-green-400/40 bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-200 transition hover:-translate-y-0.5 hover:bg-green-500/25"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-white/5 blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-zinc-950/60 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-green-950/30 backdrop-blur-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
