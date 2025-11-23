import type { ReactNode } from 'react';

interface SiteShellProps {
  children: ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#040805] via-[#060c09] to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
