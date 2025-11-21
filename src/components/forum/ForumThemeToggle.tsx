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
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:border-green-400/50 hover:text-green-100"
      aria-label="Tema değiştir"
    >
      {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {mode === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
    </button>
  );
}
