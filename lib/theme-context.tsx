'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Always-dark — theme toggle removed by design.
type Theme = 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void; // no-op kept so existing consumers don't break
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure the dark class is always applied
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950" aria-hidden>
        {/* SSR placeholder — prevents flash */}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
