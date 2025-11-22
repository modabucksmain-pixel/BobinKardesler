import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ForumThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('bk-forum-theme') as 'dark' | 'light' | null) ?? 'dark';
  });

  useEffect(() => {
    document.body.dataset.forumTheme = theme;
    localStorage.setItem('bk-forum-theme', theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:border-emerald-300/60 hover:text-emerald-100"
      aria-label="Forum temasını değiştir"
    >
      {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span>{theme === 'dark' ? 'Koyu mod' : 'Aydınlık mod'}</span>
    </button>
  );
}
