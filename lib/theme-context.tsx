'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount (client-only)
  useEffect(() => {
    const stored = localStorage.getItem('codelens-theme') as Theme | null;
    const preferred = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferred);
    setMounted(true);
  }, []);

  // Apply class to <html>
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('codelens-theme', theme);
  }, [theme, mounted]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Avoid flash by not rendering children until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950" aria-hidden>
        {/* SSR placeholder – prevents theme flash */}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
