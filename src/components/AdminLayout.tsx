import type { ReactNode } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminLayoutProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: Array<{ label: string; href: string }>;
  children: ReactNode;
}

export function AdminLayout({ title, description, backHref, actions, children }: AdminLayoutProps) {
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    window.location.href = '/admin/login';
  }

  return (
    <div className="min-h-screen bg-grid pb-16 pt-24">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-emerald-500/5 via-transparent to-emerald-500/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            {backHref && (
              <a
                href={backHref}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-zinc-200 transition hover:text-green-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard'a dön
              </a>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">{title}</h1>
              {description && <p className="text-base text-zinc-300">{description}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              {actions?.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-green-400/50 hover:text-green-200"
                >
                  {action.label}
                </a>
              ))}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl border border-white/10 bg-zinc-950/70 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-emerald-900/30 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
