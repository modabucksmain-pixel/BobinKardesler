import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemeMode = 'dark' | 'light';

export function ForumThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem('bk-forum-theme') as ThemeMode | null) ?? 'dark';
    setTheme(stored);
    document.body.dataset.forumTheme = stored;
  }, []);

  useEffect(() => {
    document.body.dataset.forumTheme = theme;
    localStorage.setItem('bk-forum-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const Icon = theme === 'dark' ? Sun : Moon;
  const label = theme === 'dark' ? 'Aydınlık moda geç' : 'Karanlık moda geç';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-emerald-300/60"
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold hidden sm:inline">{label}</span>
    </button>
  );
}
