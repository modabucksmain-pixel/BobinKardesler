import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bk-forum-theme';

type ThemeMode = 'dark' | 'light';

export function ForumThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'dark';
    setMode(saved);
  }, []);

  useEffect(() => {
    document.body.dataset.forumTheme = mode;
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return (
    <button
      onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition ${
        mode === 'dark'
          ? 'border-white/20 bg-white/10 text-white hover:border-emerald-300/60 hover:text-emerald-100'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
      aria-label="Tema değiştir"
    >
      {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {mode === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
    </button>
  );
}
